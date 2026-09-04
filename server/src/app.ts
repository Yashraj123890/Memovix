import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import routes from "./routes";
import memberRoutes from "./routes/member.routes";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import { notFound } from "./middleware/notFound.middleware";
import clientInvitationRoutes from "./routes/clientInvitation.routes";
import projectClientRoutes from "./routes/projectClient.routes";
import memoryRoutes from "./routes/memory.routes";
import timelineRoutes from "./routes/timeline.routes";
import commentRoutes from "./routes/comment.routes";
import semanticSearchRoutes from "./routes/semanticSearch.routes";
import ragRoutes from "./routes/rag.routes";
import notificationRoutes from "./routes/notification.routes";
import auditRoutes from "./routes/audit.routes";
import projectMemberRoutes from "./routes/projectMember.routes";
import summaryRoutes from "./routes/summary.routes";
import requirementRoutes from "./routes/requirement.routes";
import requirementResourceRoutes from "./routes/requirement.resource.routes";
import meetingNoteRoutes from "./routes/meetingNote.routes";
import meetingNoteResourceRoutes from "./routes/meetingNote.resource.routes";
import scopeRoutes from "./routes/scope.routes";
import deliverableRoutes from "./routes/deliverable.routes";
import decisionRoutes from "./routes/decision.routes";
import { aiLimiter, generalLimiter } from "./middleware/rateLimit.middleware";


const app = express();

// CORS restricted to the frontend origin, with credentials so the browser will
// send/receive the HttpOnly refresh cookie (blueprint §13.1 / §14 — never "*"
// on a credentialed API). Deferred from M1 to the M8 auth overhaul.
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));

// Baseline abuse protection on every route (no-op when RATE_LIMIT_ENABLED=false).
app.use(generalLimiter);

app.use("/api", routes);

app.use("/api/members", memberRoutes);
app.use("/api", clientInvitationRoutes);
app.use("/api", projectClientRoutes);
app.use("/api/memories", memoryRoutes);
app.use("/api", timelineRoutes);
app.use("/api/comments", commentRoutes);
// Stricter limit on the AI surface to protect the LLM quota (blueprint §13.5).
app.use("/api/ai", aiLimiter);
app.use("/api/ai", semanticSearchRoutes)
app.use("/api/ai", ragRoutes);;
app.use("/api/ai", summaryRoutes);  
app.use("/api/ai", requirementRoutes);
app.use("/api/ai", meetingNoteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api", projectMemberRoutes);
app.use("/api", deliverableRoutes);
app.use("/api", decisionRoutes);
app.use("/api", requirementResourceRoutes);
app.use("/api", meetingNoteResourceRoutes);
app.use("/api", scopeRoutes);
app.use(notFound);

app.use(errorHandler);
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});