import { useTestsAndName } from "@/components/hooks/useTestsAndName";
import React from "react";
import PageHeader from "../common/PageHeader.astro";
import EmptyState from "../ui/EmptyState.astro";
import ErrorAlert from "../ui/ErrorAlert.astro";
import MuscleTestForm from "./MuscleTestForm";

interface Props {
  bodyPartId: number;
  origin: string;
}

const MuscleTestsPage: React.FC<Props> = ({ bodyPartId, origin }) => {
  const { data, isLoading, error } = useTestsAndName(bodyPartId, origin);
  if (isLoading) return <div>Loading…</div>;
  if (error) return <ErrorAlert message={error} href="/body-parts" label="← Go back to body parts selection" />;
  if (!data?.tests?.length) return <EmptyState message="No muscle tests available." href="/body-parts" label="← Go back to body parts selection" />;

  const pageTitle = data.name ? `Muscle Tests for ${data.name}` : `Muscle Tests for Body Part ${bodyPartId}`;

  return (
    <>
      <PageHeader title={pageTitle} subtitle="Please rate the pain intensity…" />
      <MuscleTestForm muscleTests={data.tests} bodyPartId={bodyPartId} />
    </>
  );
};

export default MuscleTestsPage;
