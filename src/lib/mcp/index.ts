import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChapters from "./tools/list-chapters";
import listModules from "./tools/list-modules";
import getMyProgress from "./tools/get-my-progress";
import listMyDocuments from "./tools/list-my-documents";
import getDocument from "./tools/get-document";
import listMyMemories from "./tools/list-my-memories";

// Direct Supabase issuer (never the .lovable.cloud proxy) built from the
// build-time project ref. See app-mcp-server-authoring.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "wisefamilies-mcp",
  title: "WiseFamilies",
  version: "0.1.0",
  instructions:
    "Tools for the WiseFamilies AI-Ready Family course. Use these to look up the parent's course chapters and modules, read their progress, and fetch their generated Family Agreements and 30-Day Plans. All tools act as the signed-in parent.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listChapters,
    listModules,
    getMyProgress,
    listMyDocuments,
    getDocument,
    listMyMemories,
  ],
});