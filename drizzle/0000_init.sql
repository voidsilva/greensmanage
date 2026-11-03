CREATE SCHEMA "greensmanage";
--> statement-breakpoint
CREATE TYPE "greensmanage"."bet_status" AS ENUM('pending', 'green', 'red');--> statement-breakpoint
CREATE TYPE "greensmanage"."market" AS ENUM('over_under', 'btts', 'match_result', 'corners', 'asian_handicap');--> statement-breakpoint
CREATE TABLE "greensmanage"."bets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" varchar(4) NOT NULL,
	"game" varchar(80) NOT NULL,
	"league" varchar(60) NOT NULL,
	"market" "greensmanage"."market" NOT NULL,
	"odd" numeric(6, 2) NOT NULL,
	"stake" numeric(10, 2) NOT NULL,
	"status" "greensmanage"."bet_status" DEFAULT 'pending' NOT NULL,
	"placed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "greensmanage"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(40) NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"starting_bankroll" numeric(12, 2) DEFAULT 12500 NOT NULL,
	"monthly_goal" numeric(12, 2) DEFAULT 3000 NOT NULL,
	"unit_size" numeric(10, 2) DEFAULT 100 NOT NULL,
	"failed_logins" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "greensmanage"."bets" ADD CONSTRAINT "bets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "greensmanage"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bets_user_placed_idx" ON "greensmanage"."bets" USING btree ("user_id","placed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "bets_user_pending_idx" ON "greensmanage"."bets" USING btree ("user_id") WHERE "greensmanage"."bets"."status" = 'pending';