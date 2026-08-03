create index if not exists nps_responses_survey_org_fk_idx
  on public.nps_responses (survey_id, organization_id);

create index if not exists nps_responses_branch_org_survey_fk_idx
  on public.nps_responses (survey_branch_id, organization_id, survey_id);

create index if not exists nps_responses_branch_org_survey_filial_fk_idx
  on public.nps_responses (survey_branch_id, organization_id, survey_id, filial_slug);
