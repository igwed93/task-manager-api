import prisma from '../lib/prisma';

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  details,
}: {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  details?: string;
}) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, details },
  });
}