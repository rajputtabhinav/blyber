CREATE TABLE "audit_log" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_log_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_engineer_id" text,
	"actor_user_id" text,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"notes" text,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "component_instances" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"component_id" text NOT NULL,
	"serial" text NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"state" text NOT NULL,
	"current_server_id" text,
	"slot" text,
	"installed_at" timestamp with time zone,
	"installed_by_engineer_id" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "components" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"kind" text NOT NULL,
	"vendor" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"part_number" text,
	"version" text,
	"released_at" timestamp with time zone,
	"tdp_w" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "engineers" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"external_user_id" text,
	"name" text NOT NULL,
	"initials" text NOT NULL,
	"email" text NOT NULL,
	"team" text NOT NULL,
	"role" text NOT NULL,
	"active_tickets" integer DEFAULT 0 NOT NULL,
	"resolved_this_week" integer DEFAULT 0 NOT NULL,
	"workload" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"shift" text,
	"joined_at" timestamp with time zone NOT NULL,
	CONSTRAINT "engineers_external_user_id_unique" UNIQUE("external_user_id")
);
--> statement-breakpoint
CREATE TABLE "firmware_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"vendor" text NOT NULL,
	"category" text NOT NULL,
	"current_version" text NOT NULL,
	"latest_version" text NOT NULL,
	"released_at" timestamp with time zone NOT NULL,
	"applies_to" integer NOT NULL,
	"file_size_mb" integer NOT NULL,
	"critical" boolean NOT NULL,
	"state" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kb_articles" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"author_id" text NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"snippet" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"org_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_members_org_id_user_id_pk" PRIMARY KEY("org_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"image_url" text,
	"plan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"demo_seeded" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"vendor" text NOT NULL,
	"family" text,
	"name" text NOT NULL,
	"generation" text NOT NULL,
	"ru_height" integer NOT NULL,
	"cooling" text NOT NULL,
	"socket_count" integer NOT NULL,
	"max_dimms" integer NOT NULL,
	"max_gpus" integer NOT NULL,
	"max_psu_w" integer,
	"default_bios_family" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "qualification_campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"component_id" text NOT NULL,
	"platform_id" text NOT NULL,
	"owner_engineer_id" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"target_completion_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"test_plans" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"test_plan_ids" jsonb DEFAULT '[]'::jsonb,
	"run_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"result_summary" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "qualifications" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"component_id" text NOT NULL,
	"platform_id" text NOT NULL,
	"state" text NOT NULL,
	"signed_off_by_engineer_id" text,
	"signed_off_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"supporting_run_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"campaign_id" text,
	"limitations" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "racks" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"site" text NOT NULL,
	"zone" text NOT NULL,
	"height" integer NOT NULL,
	"utilization_pct" integer NOT NULL,
	"power_used_kw" double precision NOT NULL,
	"power_total_kw" double precision NOT NULL,
	"intake_c" double precision NOT NULL,
	"exhaust_c" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rma_items" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"server_id" text NOT NULL,
	"component_name" text NOT NULL,
	"vendor" text NOT NULL,
	"reason" text NOT NULL,
	"days_open" integer NOT NULL,
	"cost_usd" integer NOT NULL,
	"status" text NOT NULL,
	"opened_at" timestamp with time zone NOT NULL,
	"rma_number" text
);
--> statement-breakpoint
CREATE TABLE "servers" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"hostname" text NOT NULL,
	"vendor" text NOT NULL,
	"model" text NOT NULL,
	"generation" text NOT NULL,
	"cpu" text NOT NULL,
	"cpu_sockets" integer NOT NULL,
	"ram_gb" integer NOT NULL,
	"ram_config" text NOT NULL,
	"storage" text NOT NULL,
	"nic" text NOT NULL,
	"gpu" text,
	"serial" text NOT NULL,
	"rack_id" text NOT NULL,
	"ru_start" integer NOT NULL,
	"ru_height" integer NOT NULL,
	"owner_engineer_id" text NOT NULL,
	"status" text NOT NULL,
	"thermal_c" double precision NOT NULL,
	"power_w" integer NOT NULL,
	"bios_version" text NOT NULL,
	"bmc_version" text NOT NULL,
	"last_boot_at" timestamp with time zone NOT NULL,
	"uptime_days" integer NOT NULL,
	"notes" text,
	"platform_id" text
);
--> statement-breakpoint
CREATE TABLE "test_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"name" text NOT NULL,
	"version" text NOT NULL,
	"scope" text NOT NULL,
	"applies_to_kinds" jsonb DEFAULT '[]'::jsonb,
	"applies_to_platforms" jsonb DEFAULT '[]'::jsonb,
	"description" text,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"acceptance" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"expected_duration_min" integer NOT NULL,
	"required_equipment" jsonb DEFAULT '[]'::jsonb,
	"required_skill" text,
	"owner_engineer_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_checklist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"text" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL,
	"by_engineer_id" text,
	"at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ticket_timeline_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"ticket_id" text NOT NULL,
	"kind" text NOT NULL,
	"actor_id" text NOT NULL,
	"at" timestamp with time zone NOT NULL,
	"text" text NOT NULL,
	"detail" text
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"title" text NOT NULL,
	"server_id" text NOT NULL,
	"rack_id" text NOT NULL,
	"severity" text NOT NULL,
	"status" text NOT NULL,
	"assignee_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"sla_due_at" timestamp with time zone NOT NULL,
	"sla_state" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"description" text,
	"watchers" jsonb DEFAULT '[]'::jsonb,
	"related_ids" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "validation_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"type" text NOT NULL,
	"server_id" text NOT NULL,
	"platform_id" text,
	"campaign_id" text,
	"test_plan_id" text,
	"component_manifest" jsonb DEFAULT '[]'::jsonb,
	"measurements" jsonb DEFAULT '[]'::jsonb,
	"artifacts" jsonb DEFAULT '[]'::jsonb,
	"started_at" timestamp with time zone NOT NULL,
	"duration_min" integer NOT NULL,
	"result" text NOT NULL,
	"engineer_id" text NOT NULL,
	"pass_count" integer NOT NULL,
	"fail_count" integer NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_instances" ADD CONSTRAINT "component_instances_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_instances" ADD CONSTRAINT "component_instances_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "component_instances" ADD CONSTRAINT "component_instances_installed_by_engineer_id_engineers_id_fk" FOREIGN KEY ("installed_by_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "components" ADD CONSTRAINT "components_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "engineers" ADD CONSTRAINT "engineers_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "firmware_entries" ADD CONSTRAINT "firmware_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kb_articles" ADD CONSTRAINT "kb_articles_author_id_engineers_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualification_campaigns" ADD CONSTRAINT "qualification_campaigns_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualification_campaigns" ADD CONSTRAINT "qualification_campaigns_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualification_campaigns" ADD CONSTRAINT "qualification_campaigns_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualification_campaigns" ADD CONSTRAINT "qualification_campaigns_owner_engineer_id_engineers_id_fk" FOREIGN KEY ("owner_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_component_id_components_id_fk" FOREIGN KEY ("component_id") REFERENCES "public"."components"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualifications" ADD CONSTRAINT "qualifications_signed_off_by_engineer_id_engineers_id_fk" FOREIGN KEY ("signed_off_by_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "racks" ADD CONSTRAINT "racks_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rma_items" ADD CONSTRAINT "rma_items_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rma_items" ADD CONSTRAINT "rma_items_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_rack_id_racks_id_fk" FOREIGN KEY ("rack_id") REFERENCES "public"."racks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_owner_engineer_id_engineers_id_fk" FOREIGN KEY ("owner_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servers" ADD CONSTRAINT "servers_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "test_plans" ADD CONSTRAINT "test_plans_owner_engineer_id_engineers_id_fk" FOREIGN KEY ("owner_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_checklist_items" ADD CONSTRAINT "ticket_checklist_items_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_checklist_items" ADD CONSTRAINT "ticket_checklist_items_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_checklist_items" ADD CONSTRAINT "ticket_checklist_items_by_engineer_id_engineers_id_fk" FOREIGN KEY ("by_engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_timeline_entries" ADD CONSTRAINT "ticket_timeline_entries_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_timeline_entries" ADD CONSTRAINT "ticket_timeline_entries_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_timeline_entries" ADD CONSTRAINT "ticket_timeline_entries_actor_id_engineers_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_rack_id_racks_id_fk" FOREIGN KEY ("rack_id") REFERENCES "public"."racks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assignee_id_engineers_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reporter_id_engineers_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_runs" ADD CONSTRAINT "validation_runs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_runs" ADD CONSTRAINT "validation_runs_server_id_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_runs" ADD CONSTRAINT "validation_runs_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_runs" ADD CONSTRAINT "validation_runs_test_plan_id_test_plans_id_fk" FOREIGN KEY ("test_plan_id") REFERENCES "public"."test_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "validation_runs" ADD CONSTRAINT "validation_runs_engineer_id_engineers_id_fk" FOREIGN KEY ("engineer_id") REFERENCES "public"."engineers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_by_org_entity" ON "audit_log" USING btree ("org_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_by_org_actor" ON "audit_log" USING btree ("org_id","actor_engineer_id");--> statement-breakpoint
CREATE INDEX "audit_by_org_at" ON "audit_log" USING btree ("org_id","at");--> statement-breakpoint
CREATE INDEX "ci_by_org_component" ON "component_instances" USING btree ("org_id","component_id");--> statement-breakpoint
CREATE INDEX "ci_by_org_server" ON "component_instances" USING btree ("org_id","current_server_id");--> statement-breakpoint
CREATE INDEX "ci_by_org_state" ON "component_instances" USING btree ("org_id","state");--> statement-breakpoint
CREATE INDEX "ci_by_org_serial" ON "component_instances" USING btree ("org_id","serial");--> statement-breakpoint
CREATE INDEX "components_by_org_kind" ON "components" USING btree ("org_id","kind");--> statement-breakpoint
CREATE INDEX "components_by_org_vendor" ON "components" USING btree ("org_id","vendor");--> statement-breakpoint
CREATE INDEX "engineers_by_org" ON "engineers" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "engineers_by_external_user" ON "engineers" USING btree ("external_user_id");--> statement-breakpoint
CREATE INDEX "firmware_by_org" ON "firmware_entries" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "kb_by_org_category" ON "kb_articles" USING btree ("org_id","category");--> statement-breakpoint
CREATE INDEX "kb_by_org_author" ON "kb_articles" USING btree ("org_id","author_id");--> statement-breakpoint
CREATE INDEX "orgm_by_user" ON "org_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orgs_by_slug" ON "organizations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "platforms_by_org" ON "platforms" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "camp_by_org_status" ON "qualification_campaigns" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "camp_by_org_owner" ON "qualification_campaigns" USING btree ("org_id","owner_engineer_id");--> statement-breakpoint
CREATE INDEX "qual_by_org_component" ON "qualifications" USING btree ("org_id","component_id");--> statement-breakpoint
CREATE INDEX "qual_by_org_platform" ON "qualifications" USING btree ("org_id","platform_id");--> statement-breakpoint
CREATE INDEX "qual_by_org_state" ON "qualifications" USING btree ("org_id","state");--> statement-breakpoint
CREATE INDEX "racks_by_org" ON "racks" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "rma_by_org_server" ON "rma_items" USING btree ("org_id","server_id");--> statement-breakpoint
CREATE INDEX "rma_by_org_status" ON "rma_items" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "servers_by_org_rack" ON "servers" USING btree ("org_id","rack_id");--> statement-breakpoint
CREATE INDEX "servers_by_org_status" ON "servers" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "servers_by_org_owner" ON "servers" USING btree ("org_id","owner_engineer_id");--> statement-breakpoint
CREATE INDEX "servers_by_org_platform" ON "servers" USING btree ("org_id","platform_id");--> statement-breakpoint
CREATE INDEX "servers_by_org_hostname" ON "servers" USING btree ("org_id","hostname");--> statement-breakpoint
CREATE INDEX "servers_by_org_serial" ON "servers" USING btree ("org_id","serial");--> statement-breakpoint
CREATE INDEX "plans_by_org_scope" ON "test_plans" USING btree ("org_id","scope");--> statement-breakpoint
CREATE INDEX "plans_by_org_status" ON "test_plans" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "cli_by_org_ticket" ON "ticket_checklist_items" USING btree ("org_id","ticket_id");--> statement-breakpoint
CREATE INDEX "tl_by_org_ticket" ON "ticket_timeline_entries" USING btree ("org_id","ticket_id");--> statement-breakpoint
CREATE INDEX "tickets_by_org_server" ON "tickets" USING btree ("org_id","server_id");--> statement-breakpoint
CREATE INDEX "tickets_by_org_assignee" ON "tickets" USING btree ("org_id","assignee_id");--> statement-breakpoint
CREATE INDEX "tickets_by_org_severity" ON "tickets" USING btree ("org_id","severity");--> statement-breakpoint
CREATE INDEX "tickets_by_org_status" ON "tickets" USING btree ("org_id","status");--> statement-breakpoint
CREATE INDEX "runs_by_org_server" ON "validation_runs" USING btree ("org_id","server_id");--> statement-breakpoint
CREATE INDEX "runs_by_org_campaign" ON "validation_runs" USING btree ("org_id","campaign_id");--> statement-breakpoint
CREATE INDEX "runs_by_org_plan" ON "validation_runs" USING btree ("org_id","test_plan_id");--> statement-breakpoint
CREATE INDEX "runs_by_org_result" ON "validation_runs" USING btree ("org_id","result");--> statement-breakpoint
CREATE INDEX "runs_by_org_started" ON "validation_runs" USING btree ("org_id","started_at");