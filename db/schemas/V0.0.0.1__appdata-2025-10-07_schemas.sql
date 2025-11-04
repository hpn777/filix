-- Complete Schema Definition
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: data_providers_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.data_providers_status AS ENUM (
    'Development',
    'Staging',
    'Production'
);


--
-- Name: data_providers_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.data_providers_type AS ENUM (
    'Custom'
);


--
-- Name: remove_presets(); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.remove_presets()
    LANGUAGE sql
    AS $$
DELETE from control_preset;
DELETE from tab_preset;
$$;


--
-- Name: remove_ui_data(); Type: PROCEDURE; Schema: public; Owner: -
--

CREATE PROCEDURE public.remove_ui_data()
    LANGUAGE sql
    AS $$
DELETE from control_preset;
DELETE from tab_preset;
DELETE from control;
DELETE from tab;
DELETE from module_version;
DELETE from module_roles;
DELETE from module;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: api_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_access (
    id character varying(512) NOT NULL,
    audit boolean DEFAULT false NOT NULL,
    disable boolean,
    enforce_user boolean,
    enforce_role boolean
);


--
-- Name: api_access_app_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_access_app_role (
    app_role_id integer,
    api_access_id character varying(512),
    id integer NOT NULL
);


--
-- Name: api_access_app_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.api_access_app_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: api_access_app_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.api_access_app_role_id_seq OWNED BY public.api_access_app_role.id;


--
-- Name: app_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_role (
    id integer DEFAULT 0 NOT NULL,
    "roleName" character varying(255) DEFAULT NULL::character varying
);


--
-- Name: seq_audit; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_audit
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit (
    id integer DEFAULT nextval('public.seq_audit'::regclass) NOT NULL,
    request text NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    api_access_id character varying(512) DEFAULT NULL::character varying,
    user_id integer,
    is_deleted boolean DEFAULT false,
    deleted_on timestamp without time zone
);


--
-- Name: control; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.control (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    title character varying(255) DEFAULT NULL::character varying,
    config text,
    "tabId" character varying(255) DEFAULT NULL::character varying,
    "moduleClassName" character varying(255) DEFAULT NULL::character varying,
    "moduleVersionId" integer
);


--
-- Name: control_preset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.control_preset (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    title character varying(255) DEFAULT NULL::character varying,
    config text,
    "tabPresetId" character varying(255) DEFAULT NULL::character varying,
    "moduleClassName" character varying(255) DEFAULT NULL::character varying,
    "moduleVersionId" integer
);


--
-- Name: seq_data_providers; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_data_providers
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: data_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_providers (
    id integer DEFAULT nextval('public.seq_data_providers'::regclass) NOT NULL,
    name character varying(255) DEFAULT NULL::character varying,
    type public.data_providers_type,
    status public.data_providers_status,
    code text,
    config text
);


--
-- Name: module; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module (
    id integer NOT NULL,
    name character varying(255) DEFAULT NULL::character varying,
    "moduleClassName" character varying(255) DEFAULT NULL::character varying,
    "moduleType" character varying(255) DEFAULT NULL::character varying,
    "moduleGroup" character varying(255) DEFAULT NULL::character varying,
    "parentId" integer,
    description text
);


--
-- Name: seq_module_roles; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_module_roles
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: module_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_roles (
    id integer DEFAULT nextval('public.seq_module_roles'::regclass) NOT NULL,
    module_id integer NOT NULL,
    roles_id integer NOT NULL
);


--
-- Name: seq_module_version; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_module_version
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: module_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.module_version (
    id integer DEFAULT nextval('public.seq_module_version'::regclass) NOT NULL,
    config text,
    version integer NOT NULL,
    "moduleId" integer DEFAULT 0 NOT NULL,
    public boolean DEFAULT true NOT NULL
);


--
-- Name: seq_tab_type; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_tab_type
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_user_data; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_user_data
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seq_user_roles; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.seq_user_roles
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tab; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tab (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    "userId" integer,
    name character varying(255) DEFAULT NULL::character varying,
    selected boolean DEFAULT false NOT NULL,
    "sortOrder" integer,
    config text,
    "typeId" integer,
    "parentId" character varying(255) DEFAULT NULL::character varying,
    is_deleted boolean DEFAULT false,
    deleted_on timestamp without time zone
);


--
-- Name: tab_preset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tab_preset (
    id character varying(255) DEFAULT ''::character varying NOT NULL,
    name character varying(255) DEFAULT NULL::character varying,
    config text,
    "parentId" character varying(255) DEFAULT NULL::character varying,
    "userId" integer,
    "typeId" integer,
    "sortOrder" integer DEFAULT 0,
    is_deleted boolean DEFAULT false,
    deleted_on timestamp without time zone
);


--
-- Name: tab_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tab_type (
    id integer DEFAULT nextval('public.seq_tab_type'::regclass) NOT NULL,
    name character varying(255) DEFAULT NULL::character varying
);


--
-- Name: user_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_data (
    id integer DEFAULT nextval('public.seq_user_data'::regclass) NOT NULL,
    "userName" character varying(255) DEFAULT NULL::character varying,
    password character varying(255) DEFAULT NULL::character varying,
    email character varying(255) DEFAULT NULL::character varying,
    config text,
    "displayName" character varying(255) DEFAULT NULL::character varying,
    active boolean DEFAULT true NOT NULL,
    "authToken" character varying(64) DEFAULT NULL::character varying,
    "tokenCreated" timestamp with time zone,
    "firstLogin" boolean DEFAULT true,
    is_deleted boolean DEFAULT false,
    deleted_on timestamp without time zone
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id integer DEFAULT nextval('public.seq_user_roles'::regclass) NOT NULL,
    user_id integer NOT NULL,
    roles_id integer NOT NULL,
    is_deleted boolean DEFAULT false,
    deleted_on timestamp without time zone
);


--
-- Name: api_access_app_role id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_access_app_role ALTER COLUMN id SET DEFAULT nextval('public.api_access_app_role_id_seq'::regclass);


--
-- Name: api_access PK_api_access; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_access
    ADD CONSTRAINT "PK_api_access" PRIMARY KEY (id);


--
-- Name: app_role PK_app_role; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_role
    ADD CONSTRAINT "PK_app_role" PRIMARY KEY (id);


--
-- Name: audit PK_audit; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT "PK_audit" PRIMARY KEY (id);


--
-- Name: control PK_control; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT "PK_control" PRIMARY KEY (id);


--
-- Name: control_preset PK_control_preset; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_preset
    ADD CONSTRAINT "PK_control_preset" PRIMARY KEY (id);


--
-- Name: data_providers PK_data_providers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_providers
    ADD CONSTRAINT "PK_data_providers" PRIMARY KEY (id);


--
-- Name: module PK_module; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module
    ADD CONSTRAINT "PK_module" PRIMARY KEY (id);


--
-- Name: module_roles PK_module_roles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_roles
    ADD CONSTRAINT "PK_module_roles" PRIMARY KEY (id);


--
-- Name: module_version PK_module_version; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_version
    ADD CONSTRAINT "PK_module_version" PRIMARY KEY (id);


--
-- Name: tab PK_tab; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab
    ADD CONSTRAINT "PK_tab" PRIMARY KEY (id);


--
-- Name: tab_preset PK_tab_preset; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab_preset
    ADD CONSTRAINT "PK_tab_preset" PRIMARY KEY (id);


--
-- Name: tab_type PK_tab_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab_type
    ADD CONSTRAINT "PK_tab_type" PRIMARY KEY (id);


--
-- Name: user_data PK_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT "PK_user" PRIMARY KEY (id);


--
-- Name: user_roles PK_user_roles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_user_roles" PRIMARY KEY (id);


--
-- Name: user_data UNQ_authToken; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_data
    ADD CONSTRAINT "UNQ_authToken" UNIQUE ("authToken");


--
-- Name: module_version UNQ_module_version; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_version
    ADD CONSTRAINT "UNQ_module_version" UNIQUE (version, "moduleId");


--
-- Name: api_access_app_role api_access_app_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_access_app_role
    ADD CONSTRAINT api_access_app_role_pkey PRIMARY KEY (id);

--
-- Name: IXFK_audit_api_access1_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_audit_api_access1_id" ON public.audit USING btree (api_access_id);


--
-- Name: IXFK_audit_user1_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_audit_user1_id" ON public.audit USING btree (user_id);


--
-- Name: IXFK_control_module_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_control_module_version" ON public.control USING btree ("moduleVersionId");


--
-- Name: IXFK_control_preset_module_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_control_preset_module_version" ON public.control_preset USING btree ("moduleVersionId");


--
-- Name: IXFK_control_preset_tabPresetId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_control_preset_tabPresetId" ON public.control_preset USING btree ("tabPresetId");


--
-- Name: IXFK_control_tabIdx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_control_tabIdx" ON public.control USING btree ("tabId");


--
-- Name: IXFK_module_roles_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_module_roles_module_id" ON public.module_roles USING btree (module_id);


--
-- Name: IXFK_module_roles_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_module_roles_role_id" ON public.module_roles USING btree (roles_id);


--
-- Name: IXFK_module_version_module; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_module_version_module" ON public.module_version USING btree ("moduleId");


--
-- Name: IXFK_tab_preset_tab_typeIdx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_tab_preset_tab_typeIdx" ON public.tab_preset USING btree ("typeId");


--
-- Name: IXFK_tab_preset_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_tab_preset_user_id" ON public.tab_preset USING btree ("userId");


--
-- Name: IXFK_tab_tab_typeId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_tab_tab_typeId" ON public.tab USING btree ("typeId");


--
-- Name: IXFK_tab_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_tab_userId" ON public.tab USING btree ("userId");


--
-- Name: IXFK_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_user_id" ON public.user_roles USING btree (user_id, roles_id);


--
-- Name: IXFK_user_role_role_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IXFK_user_role_role_id" ON public.user_roles USING btree (roles_id);

--
-- Name: audit FK_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit
    ADD CONSTRAINT "FK_audit_user" FOREIGN KEY (user_id) REFERENCES public.user_data(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: control FK_control_module_version; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT "FK_control_module_version" FOREIGN KEY ("moduleVersionId") REFERENCES public.module_version(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: control_preset FK_control_peset_tab_preset; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_preset
    ADD CONSTRAINT "FK_control_peset_tab_preset" FOREIGN KEY ("tabPresetId") REFERENCES public.tab_preset(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: control_preset FK_control_preset_module_version; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control_preset
    ADD CONSTRAINT "FK_control_preset_module_version" FOREIGN KEY ("moduleVersionId") REFERENCES public.module_version(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: control FK_control_tab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.control
    ADD CONSTRAINT "FK_control_tab" FOREIGN KEY ("tabId") REFERENCES public.tab(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: module_roles FK_module_roles_module; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_roles
    ADD CONSTRAINT "FK_module_roles_module" FOREIGN KEY (module_id) REFERENCES public.module(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: module_roles FK_module_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_roles
    ADD CONSTRAINT "FK_module_roles_role" FOREIGN KEY (roles_id) REFERENCES public.app_role(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: module_version FK_module_version_module; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.module_version
    ADD CONSTRAINT "FK_module_version_module" FOREIGN KEY ("moduleId") REFERENCES public.module(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tab_preset FK_tab_preset_tab_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab_preset
    ADD CONSTRAINT "FK_tab_preset_tab_type" FOREIGN KEY ("typeId") REFERENCES public.tab_type(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tab_preset FK_tab_preset_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab_preset
    ADD CONSTRAINT "FK_tab_preset_user" FOREIGN KEY ("userId") REFERENCES public.user_data(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tab FK_tab_type; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab
    ADD CONSTRAINT "FK_tab_type" FOREIGN KEY ("typeId") REFERENCES public.tab_type(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tab FK_tab_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tab
    ADD CONSTRAINT "FK_tab_user" FOREIGN KEY ("userId") REFERENCES public.user_data(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: user_roles FK_user_roles_role; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_user_roles_role" FOREIGN KEY (roles_id) REFERENCES public.app_role(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: user_roles FK_user_roles_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_user_roles_user" FOREIGN KEY (user_id) REFERENCES public.user_data(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: api_access_app_role api_access_app_role_api_access_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_access_app_role
    ADD CONSTRAINT api_access_app_role_api_access_id_fkey FOREIGN KEY (api_access_id) REFERENCES public.api_access(id) ON UPDATE CASCADE;


--
-- Name: api_access_app_role api_access_app_role_app_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_access_app_role
    ADD CONSTRAINT api_access_app_role_app_role_id_fkey FOREIGN KEY (app_role_id) REFERENCES public.app_role(id) ON UPDATE CASCADE ON DELETE CASCADE;

-- -- Grant permissions to appdata user
-- GRANT ALL ON SCHEMA public TO appdata;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO appdata;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO appdata;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO appdata;

-- -- Set default privileges for future objects
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO appdata;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO appdata;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO appdata;

SELECT 'Database initialized successfully with complete schema' AS status;
