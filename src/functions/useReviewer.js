// useReviewer.js
import { useState } from "react";
import { TbCardsFilled, TbPlayCardAFilled } from "react-icons/tb";
import { LuStickyNote } from "react-icons/lu";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { useLoaderData } from "react-router-dom";

export const useReviewer = () => {
  const folder = useLoaderData();
  const reviewers = folder.reviewers || [];

  const [extended, setExtended] = useState(false);

  // --- Folder Info ---
  let headingText = "REVIEWERS";
  let IconComponent = TbCardsFilled;
  let iconSize = 80;
  let isFlashCard = false;

  if (folder.id === "TermsAndDefinitions") {
    headingText = "TERMS AND DEFINITION";
    IconComponent = TbCardsFilled;
    iconSize = 80;
    isFlashCard = true;
  } else if (folder.id === "SummarizedReviewers") {
    headingText = "SUMMARIZED REVIEWERS";
    IconComponent = LuStickyNote;
    iconSize = 80;
    isFlashCard = false;
  } else if (folder.id === "AcronymMnemonics") {
    headingText = "ACRONYM MNEMONICS";
    IconComponent = TbPlayCardAFilled;
    iconSize = 90;
    isFlashCard = true;
  } else if (folder.id === "SummarizedAIReviewers") {
    headingText = "SUMMARIZED AI REVIEWERS";
    IconComponent = FaWandMagicSparkles;
    iconSize = 75;
    isFlashCard = false;
  }

  // --- Sorting ---
  const sortedReviewers = [...reviewers].sort((a, b) =>
    b.id.localeCompare(a.id, undefined, { numeric: true })
  );

  // --- Milestone Functions ---
  const calculateMilestones = (startDate) => {
    const milestones = [];
    for (let i = 1; i <= 4; i++) {
      const milestone = new Date(startDate);
      milestone.setDate(startDate.getDate() + i * 7);
      milestones.push(milestone);
    }
    return milestones;
  };

  const isAllMilestonesDone = (milestones) => {
    const today = new Date();
    return today > milestones[milestones.length - 1];
  };

  const getMilestoneColor = (milestones) => {
    const today = new Date();
    const nextMilestone = milestones.find((date) => today <= date) || milestones[milestones.length - 1];
    const diffInDays = Math.floor((nextMilestone - today) / (1000 * 60 * 60 * 24));
    if (diffInDays <= 1) return "red";
    if (diffInDays <= 3) return "yellow";
    return "green";
  };

  return {
    state: { headingText, IconComponent, iconSize, isFlashCard, extended, sortedReviewers },
    actions: { setExtended, calculateMilestones, isAllMilestonesDone, getMilestoneColor },
  };
};
