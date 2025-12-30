import ActivityLog from "../models/activityLog.model.js";

export const logActivity = async ({
  req,
  action,
  module,
  description,
  targetId = null,
  bay = null,
  meta = {},
}) => {
  try {
    const res = await ActivityLog.create({
      actor: req.user.id,
      actorRole: req.user.role,
      action,
      module,
      description,
      targetId,
      bay,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      meta,
    });
    if(res){
        console.log("Activiti log created:", res);
        
    }
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};
