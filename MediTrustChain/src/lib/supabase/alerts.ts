import { createClient } from './client';
import type { AnomalyDetection } from '@/types/analytics';
import type { Notification } from '@/contexts/notifications-context';

const supabase = createClient();

/**
 * Saves a detected anomaly to Supabase
 */
export async function saveAnomaly(anomaly: AnomalyDetection) {
    const { data, error } = await supabase
        .from('anomalies')
        .upsert({
            id: anomaly.id,
            batch_id: anomaly.batchId,
            type: anomaly.type,
            severity: anomaly.severity,
            description: anomaly.description,
            detected_at: anomaly.detectedAt,
            status: anomaly.status,
            metadata: {
                confidence: anomaly.confidence,
                location: anomaly.location,
                expectedValue: anomaly.expectedValue,
                actualValue: anomaly.actualValue,
                drugName: anomaly.drugName
            }
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving anomaly:', error);
        throw error;
    }
    return data;
}

/**
 * Fetches anomalies from Supabase
 */
export async function fetchAnomalies() {
    const { data, error } = await supabase
        .from('anomalies')
        .select('*')
        .order('detected_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Fetches notifications for a specific user
 */
export async function fetchNotifications(userId: string) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Creates a notification in Supabase
 */
export async function createPersistentNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
    batchId?: string,
    anomalyId?: string
) {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title: notification.title,
            description: notification.description,
            type: 'warning', // Default for anomalies
            batch_id: batchId,
            anomaly_id: anomalyId
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Marks a notification as read in Supabase
 */
export async function markNotificationRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) throw error;
}

/**
 * Broadcasts an alert to all regulators (Simplified for this demo)
 * In a real app, this would be a Postgres trigger or a serverless function.
 */
export async function notifyRegulators(title: string, description: string, batchId?: string, anomalyId?: string) {
    // 1. Get all regulators from stakeholders table
    const { data: regulators, error } = await supabase
        .from('stakeholders')
        .select('user_id')
        .eq('role', 'regulator')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching regulators:', error);
        return; // Don't throw - notifications are not critical
    }

    // 2. Insert notifications for each regulator that has a user_id
    if (regulators && regulators.length > 0) {
        const validRegulators = regulators.filter(r => r.user_id);

        if (validRegulators.length > 0) {
            const notifications = validRegulators.map(r => ({
                user_id: r.user_id,
                title,
                description,
                type: 'danger',
                batch_id: batchId,
                anomaly_id: anomalyId
            }));

            const { error: insertError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (insertError) {
                console.error('Error inserting notifications:', insertError);
            }
        }
    }
}
