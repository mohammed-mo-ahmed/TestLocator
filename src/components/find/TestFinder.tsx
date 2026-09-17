"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";

import CenterPicker from "@/components/find/CenterPicker";
import FindMethod from "@/components/find/FindMethod";
import RatingDialog from "@/components/find/RatingDialog";
import ResultsView from "@/components/find/ResultsView";
import TestSelector from "@/components/find/TestSelector";
import type { TestCenter, TestInfo, UserLocation } from "@/lib/types";

type Step = "test" | "method" | "center" | "results";

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function TestFinder() {
  const [step, setStep] = useState<Step>("test");
  const [test, setTest] = useState<TestInfo | null>(null);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [pickedCenter, setPickedCenter] = useState<TestCenter | null>(null);

  const handleTestSelect = useCallback((selected: TestInfo) => {
    setTest(selected);
    setStep("method");
  }, []);

  const handleLocated = useCallback((point: UserLocation) => {
    setLocation(point);
    setPickedCenter(null);
    setStep("results");
  }, []);

  const handlePickCenter = useCallback(() => {
    setStep("center");
  }, []);

  const handleCenterConfirm = useCallback((center: TestCenter) => {
    setPickedCenter(center);
    setLocation(null);
    setStep("results");
  }, []);

  const handleBackFromMethod = useCallback(() => {
    setStep("test");
  }, []);

  const handleBackFromCenter = useCallback(() => {
    setStep("method");
  }, []);

  const handleBackFromResults = useCallback(() => {
    setStep(pickedCenter ? "center" : "method");
  }, [pickedCenter]);

  const handleRestart = useCallback(() => {
    setTest(null);
    setLocation(null);
    setPickedCenter(null);
    setStep("test");
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <AnimatePresence mode="wait">
        {step === "test" && (
          <motion.div
            key="test"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <TestSelector onSelect={handleTestSelect} />
          </motion.div>
        )}

        {step === "method" && test && (
          <motion.div
            key="method"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <FindMethod
              test={test}
              onBack={handleBackFromMethod}
              onLocated={handleLocated}
              onPickCenter={handlePickCenter}
            />
          </motion.div>
        )}

        {step === "center" && test && (
          <motion.div
            key="center"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <CenterPicker test={test} onBack={handleBackFromCenter} onConfirm={handleCenterConfirm} />
          </motion.div>
        )}

        {step === "results" && test && (location || pickedCenter) && (
          <motion.div
            key="results"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <ResultsView
              test={test}
              location={location}
              focusCenter={pickedCenter}
              onBack={handleBackFromResults}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {step === "results" ? <RatingDialog /> : null}
    </div>
  );
}