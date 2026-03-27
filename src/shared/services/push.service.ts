import { firebaseMessaging } from '../../config/firebase';
import prisma from '../../config/database';

export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  if (!firebaseMessaging) return;

  try {
    // Get user's FCM tokens from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    await firebaseMessaging.send({
      token: user.fcmToken,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high',
        notification: { channelId: 'papers_default' },
      },
      apns: {
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    });
  } catch (err: any) {
    // Token might be expired, log but don't crash
    console.warn('[FCM] Failed to send push:', err.code || err.message);
  }
}

export async function sendPushToMultiple(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
) {
  await Promise.allSettled(userIds.map((id) => sendPushNotification(id, title, body, data)));
}
