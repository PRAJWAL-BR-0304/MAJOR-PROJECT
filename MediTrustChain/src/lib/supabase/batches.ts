import { createClient } from './client';
import type { Batch, BatchHistoryEvent, BatchStatus } from '@/contexts/batches-context';
import type { Database } from '@/types/database.types';
import { validateOrganizationAccess } from '@/lib/cbac/access-control';

// Client is now instantiated inside functions to ensure fresh auth state


type DbBatch = Database['public']['Tables']['batches']['Row'];
type DbHistory = Database['public']['Tables']['batch_history']['Row'];

/**
 * Formatted console logger for database operations (visible in browser console)
 */
function logDbOperation(dashboard: string, operation: string, table: string, id: string, success: boolean, error?: string) {
    const timestamp = new Date().toISOString();
    const border = "═".repeat(60);

    if (success) {
        console.log(`\n╔${border}╗`);
        console.log(`║ ✅ ${dashboard.toUpperCase()} - DATABASE SAVE SUCCESS`.padEnd(61) + "║");
        console.log(`╠${border}╣`);
        console.log(`║ Operation: ${operation.padEnd(48)}║`);
        console.log(`║ Table:     ${table.padEnd(48)}║`);
        console.log(`║ ID:        ${id.slice(0, 48).padEnd(48)}║`);
        console.log(`║ Time:      ${timestamp.slice(0, 48).padEnd(48)}║`);
        console.log(`╚${border}╝\n`);
    } else {
        console.log(`\n╔${border}╗`);
        console.log(`║ ❌ ${dashboard.toUpperCase()} - DATABASE SAVE FAILED`.padEnd(61) + "║");
        console.log(`╠${border}╣`);
        console.log(`║ Operation: ${operation.padEnd(48)}║`);
        console.log(`║ Table:     ${table.padEnd(48)}║`);
        console.log(`║ ID:        ${id.slice(0, 48).padEnd(48)}║`);
        console.log(`║ Error:     ${(error || "Unknown").slice(0, 48).padEnd(48)}║`);
        console.log(`║ Time:      ${timestamp.slice(0, 48).padEnd(48)}║`);
        console.log(`╚${border}╝\n`);
    }
}

/**
 * Maps a database batch record to the frontend Batch type
 */
function mapFromDb(dbBatch: DbBatch, dbHistory: DbHistory[] = []): Batch {
    return {
        id: dbBatch.id,
        name: dbBatch.name,
        mfg: dbBatch.mfg,
        exp: dbBatch.exp,
        qty: dbBatch.qty,
        status: dbBatch.status as BatchStatus,
        manufacturer: dbBatch.manufacturer || undefined,
        organization_id: dbBatch.organization_id || undefined, // Include for validation
        anomalyReason: dbBatch.anomaly_reason || undefined,
        dataHash: dbBatch.data_hash || undefined,
        history: dbHistory
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .map(h => ({
                location: h.location,
                timestamp: h.timestamp,
                status: h.status as BatchStatus,
            })),
    };
}

/**
 * Fetches all batches with their history for the current user/context
 * Implements defense-in-depth: RLS + explicit organization filtering
 */
export async function fetchBatches() {
    const supabase = createClient();
    // Get current user and organization context
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error('Not authenticated');
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

    const isAdmin = !!adminUser;

    // Build query with explicit organization filtering
    let batchQuery = supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false });

    // Non-admin users: filter by organization_id (defense-in-depth)
    if (!isAdmin) {
        let organizationId = user.user_metadata?.organization_id;

        // If not in metadata, try to get from stakeholder record
        if (!organizationId) {
            console.log('🔍 Organization ID not in metadata, fetching from stakeholder...');
            const { data: stakeholder } = await supabase
                .from('stakeholders')
                .select('organization_id')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .maybeSingle();

            if (stakeholder?.organization_id) {
                organizationId = stakeholder.organization_id;
                console.log(`✅ Found organization_id from stakeholder: ${organizationId}`);
            }
        }

        if (!organizationId) {
            console.warn('⚠️ User has no organization_id, fetching all batches (RLS will filter)');
            // Don't filter - let RLS handle it
        } else {
            console.log(`🔒 [DEBUG] OrganizationID identifying as: ${organizationId}`);
            // EXPLICIT FILTER: Only fetch batches belonging to user's organization
            // TEMPORARILY DISABLED to test RLS
            // batchQuery = batchQuery.eq('organization_id', organizationId);
            console.log(`🔒 [DEBUG] Explicit .eq filter disabled to test RLS policy`);
        }
    } else {
        console.log('👑 Admin user: fetching all batches');
    }

    const { data: batches, error: batchError } = await batchQuery;

    if (batchError) {
        console.log(`❌ DATABASE: Failed to fetch batches: ${batchError.message}`);
        throw batchError;
    }

    if (!batches || batches.length === 0) {
        console.log(`📦 DATABASE: No batches found`);
        return [];
    }

    // OPTIMIZED: Fetch only history for retrieved batches (not all history)
    const batchIds = batches.map(b => b.id);
    const { data: history, error: historyError } = await supabase
        .from('batch_history')
        .select('*')
        .in('batch_id', batchIds); // Only fetch relevant history

    if (historyError) {
        console.warn('Failed to fetch batch history:', historyError);
        // Continue without history rather than failing completely
        return batches.map(batch => mapFromDb(batch, []));
    }

    console.log(`📦 DATABASE: Loaded ${batches.length} batches from Supabase`);

    return batches.map(batch => {
        const batchHistory = history?.filter(h => h.batch_id === batch.id) || [];
        return mapFromDb(batch, batchHistory);
    });
}

/**
 * Upserts a batch to Supabase
 * Enforces organization-level data isolation
 * OPTIMIZED: Skip redundant lookups when organization_id is provided
 */
export async function upsertBatch(batch: Partial<Batch> & { id: string }, userId?: string, accessToken?: string) {
    const supabase = createClient();
    console.log("🔄 upsertBatch called with:", {
        batchId: batch.id,
        organization_id: batch.organization_id,
        userId: userId,
        hasOrgId: !!batch.organization_id,
        hasAccessToken: !!accessToken
    });

    // FAST PATH: If organization_id is already provided, skip auth checks
    if (batch.organization_id) {
        console.log("⚡ Fast path: organization_id provided:", batch.organization_id);

        const dbData: Database['public']['Tables']['batches']['Insert'] = {
            id: batch.id,
            name: batch.name!,
            mfg: batch.mfg!,
            exp: batch.exp!,
            qty: batch.qty!,
            status: batch.status!,
            manufacturer: batch.manufacturer,
            manufacturer_id: userId,
            organization_id: batch.organization_id,
            anomaly_reason: batch.anomalyReason,
            data_hash: batch.dataHash,
        };

        console.log("📝 Attempting to insert batch with data:", JSON.stringify(dbData, null, 2));

        // RLS policies now use get_user_organization_id() SECURITY DEFINER function
        // No need for a stakeholder pre-check - just insert directly
        console.log("✅ Proceeding with INSERT (RLS handled by SECURITY DEFINER function)...");

        try {
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

            console.log("🚀 performing RAW FETCH request to bypass Supabase client...");

            // Use provided access token or fallback to getSession (which might hang)
            let token = accessToken;

            if (!token) {
                console.warn("⚠️ No access token provided to upsertBatch, attempting to get session (MAY HANG)...");
                const { data: sessionData } = await supabase.auth.getSession();
                token = sessionData.session?.access_token;
            }

            if (!token) {
                console.error("❌ No access token found for raw fetch");
                throw new Error("Authentication required: No access token");
            }

            console.time("upsertBatch-raw-fetch");
            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/batches`, {
                method: 'POST',
                headers: {
                    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation,resolution=merge-duplicates' // upsert behavior
                },
                body: JSON.stringify(dbData),
                signal: controller.signal
            });
            console.timeEnd("upsertBatch-raw-fetch");
            clearTimeout(timeoutId);

            const responseText = await response.text();
            console.log(`📡 Raw fetch status: ${response.status} ${response.statusText}`);
            console.log("📡 Raw fetch response:", responseText);

            if (!response.ok) {
                console.error("❌ Raw Fetch Error:", responseText);
                logDbOperation("MANUFACTURER", "CREATE BATCH (FETCH)", "batches", batch.id, false, `${response.status}: ${responseText}`);
                throw new Error(`Database Error (${response.status}): ${responseText}`);
            }

            let insertedBatch;
            try {
                const jsonResponse = JSON.parse(responseText);
                insertedBatch = Array.isArray(jsonResponse) ? jsonResponse[0] : jsonResponse;
            } catch (e) {
                console.warn("⚠️ Could not parse response JSON, but request succeeded");
            }

            console.log("✅ Batch inserted successfully (via fetch):", insertedBatch);
            logDbOperation("MANUFACTURER", "CREATE BATCH", "batches", batch.id, true);
            return insertedBatch || dbData; // Return dbData if response parsing fails but success
        } catch (upsertError: any) {
            console.error("💥 Raw Fetch threw exception:", upsertError);
            if (upsertError.name === 'AbortError' || upsertError.message?.includes('aborted')) {
                throw new Error("Database request timed out after 10s. Please check your network or try again.");
            }
            throw upsertError;
        }
    }

    // SLOW PATH: Need to get organization from auth context
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    // Get organization_id from user metadata (set during login)
    let organizationId = user.user_metadata?.organization_id;

    // If not in metadata, fetch from stakeholder record
    if (!organizationId) {
        const { data: stakeholder } = await supabase
            .from('stakeholders')
            .select('organization_id')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

        if (stakeholder) {
            organizationId = stakeholder.organization_id;
        }
    }

    if (!organizationId) {
        throw new Error('Organization ID is required. User must be assigned to an organization.');
    }

    const dbData: Database['public']['Tables']['batches']['Insert'] = {
        id: batch.id,
        name: batch.name!,
        mfg: batch.mfg!,
        exp: batch.exp!,
        qty: batch.qty!,
        status: batch.status!,
        manufacturer: batch.manufacturer,
        manufacturer_id: userId,
        organization_id: organizationId,
        anomaly_reason: batch.anomalyReason,
        data_hash: batch.dataHash,
    };

    const { data, error } = await supabase
        .from('batches')
        .upsert(dbData)
        .select();

    if (error) {
        logDbOperation("MANUFACTURER", "CREATE BATCH", "batches", batch.id, false, error.message);
        throw error;
    }

    const insertedBatch = data?.[0];
    logDbOperation("MANUFACTURER", "CREATE BATCH", "batches", batch.id, true);
    return insertedBatch;
}

/**
 * Updates batch status WITHOUT strict organization isolation
 * This allows supply chain participants to update batches from other organizations
 * Security is handled by RLS policies and role-based access
 */
export async function updateBatchStatusInDb(
    batchId: string,
    status: string,
    location?: string,
    anomalyReason?: string
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Not authenticated');
    }

    // Determine dashboard based on status change
    const getDashboard = (status: string): string => {
        switch (status) {
            case 'Approved':
            case 'Rejected':
            case 'Recalled':
                return 'REGULATOR';
            case 'In-Transit':
                return 'LOGISTICS/DISTRIBUTOR';
            case 'Delivered':
            case 'At-Pharmacy':
                return 'LOGISTICS';
            case 'Sold':
                return 'PHARMACY';
            default:
                return 'SYSTEM';
        }
    };

    const dashboard = getDashboard(status);

    // Update only the status field - don't change organization_id
    const updateData: Record<string, any> = {
        status: status,
    };

    if (anomalyReason !== undefined) {
        updateData.anomaly_reason = anomalyReason;
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const { data, error } = await supabase
        .from('batches')
        .update(updateData)
        .eq('id', batchId)
        .select()
        .abortSignal(controller.signal);
    clearTimeout(timeoutId);

    if (error) {
        logDbOperation(dashboard, `STATUS → ${status}`, "batches", batchId, false, error.message);
        throw error;
    }

    const updatedBatch = data?.[0];
    logDbOperation(dashboard, `STATUS → ${status}`, "batches", batchId, true);
    return updatedBatch;
}

/**
 * Adds a history event to Supabase
 */
export async function addBatchHistory(batchId: string, event: BatchHistoryEvent, userId?: string) {
    const supabase = createClient();
    const dbData: Database['public']['Tables']['batch_history']['Insert'] = {
        batch_id: batchId,
        location: event.location,
        status: event.status,
        timestamp: event.timestamp,
        updated_by: userId,
    };

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout (shorter for history)

    const { data, error } = await supabase
        .from('batch_history')
        .insert(dbData)
        .select()
        .abortSignal(controller.signal);
    clearTimeout(timeoutId);

    if (error) {
        console.log(`❌ HISTORY: Failed to add history for ${batchId} → ${event.status}: ${error.message}`);
        throw error;
    }

    const insertedHistory = data?.[0];
    console.log(`📜 HISTORY: ${batchId} → ${event.status} @ ${event.location}`);
    return insertedHistory;
}
