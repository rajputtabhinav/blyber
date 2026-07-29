// ============================================================
// Existing exports (legacy + ongoing)
// ============================================================
export { engineers, engineerById } from "./engineers";
export { servers, serverById } from "./servers";
export { tickets, timelineFor1247, checklistFor1247, ticketById } from "./tickets";
export { racks, rackById } from "./racks";
export { matrixComponents, matrixServerModels, matrixCells, getCell } from "./components";
export { firmware } from "./firmware";
export { kbArticles, kbCategoryCounts } from "./kb";
export { rmaItems } from "./rma";
export { validationRuns } from "./reports";

// ============================================================
// NEW — qualification model (Session 1)
// ============================================================
export { platforms, platformById, derivePlatformId } from "./platforms";
export { catalog, componentById, componentsByKind } from "./catalog";
export {
  componentInstances,
  componentInstanceById,
  instancesByServer,
  instancesByComponent,
} from "./componentInstances";
export {
  qualifications,
  campaigns,
  qualificationById,
  campaignById,
  qualificationsByComponent,
  qualificationsByPlatform,
} from "./qualifications";
export { testPlans, testPlanById, testPlansForKind } from "./plans";
