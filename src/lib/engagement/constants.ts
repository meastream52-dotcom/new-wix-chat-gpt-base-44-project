export const HEARTBEAT_INTERVAL_SECONDS = 30;
export const MIN_QUALIFIED_SECONDS = 20; // sessions shorter than this earn nothing
export const MAX_DAILY_QUALIFIED_SECONDS_PER_POST = 600; // 10 min per post per user per day
export const SESSION_IDLE_TIMEOUT_SECONDS = 120; // no heartbeat for 2 min = session over
export const READ_POINTS_PER_MINUTE = 1;

export type EngagementType =
  | "post_published"
  | "comment_created"
  | "read_session_completed"
  | "reaction_created";

export const POINTS = {
  post_published: 5,
  comment_created: 2,
  reaction_created: 0, // likes earn the receiver, computed at distribution time
} as const;

/**
 * Daily caps on how many events of a type can earn points. Events past the
 * cap are still recorded (for analytics/fraud) but carry 0 points.
 * post_published stays capped at 2 counted even for premium users.
 */
export const DAILY_POINT_CAPS: Partial<Record<EngagementType, number>> = {
  post_published: 2,
  comment_created: 10,
};
