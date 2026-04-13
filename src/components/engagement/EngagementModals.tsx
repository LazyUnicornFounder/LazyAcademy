import { motion } from "framer-motion";
import { Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BADGE_CONFIG, ACCESSORY_UNLOCKS, xpForNextLevel } from "@/lib/engagement";
import type { EngagementResult } from "@/lib/engagement";

interface LevelUpModalProps {
  open: boolean;
  onClose: () => void;
  result: EngagementResult;
}

export const LevelUpModal = ({ open, onClose, result }: LevelUpModalProps) => {
  const newAccessory = ACCESSORY_UNLOCKS.find((a) => a.level === result.newLevel);
  const { current, needed } = xpForNextLevel(result.newXpTotal);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#faf9f5] border-[#e5e4de] rounded-2xl max-w-sm text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="py-4"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="font-serif text-2xl font-medium text-[#141413] mb-1">
            Level {result.newLevel}!
          </h2>
          <p className="text-[#5e5d59] text-sm mb-4">
            +{result.xpGained} XP earned
          </p>

          <div className="rounded-xl bg-white border border-[#e5e4de] p-4 mb-4">
            <div className="flex items-center justify-between text-xs text-[#87867f] mb-2">
              <span>Level {result.newLevel}</span>
              <span>{current}/{needed} XP</span>
            </div>
            <div className="h-2 rounded-full bg-[#e5e4de] overflow-hidden">
              <motion.div
                className="h-full bg-[#c96442] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(current / needed) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
              />
            </div>
          </div>

          {newAccessory && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl bg-[#c96442]/5 border border-[#c96442]/20 p-4 mb-4"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[#c96442]" />
                <span className="text-sm font-medium text-[#c96442]">New Accessory Unlocked!</span>
              </div>
              <div className="text-3xl mb-1">{newAccessory.emoji}</div>
              <p className="text-sm text-[#5e5d59]">{newAccessory.label}</p>
            </motion.div>
          )}

          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#c96442] hover:bg-[#b5593a] text-white"
          >
            Continue
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

interface BadgeEarnedModalProps {
  open: boolean;
  onClose: () => void;
  badgeTypes: string[];
}

export const BadgeEarnedModal = ({ open, onClose, badgeTypes }: BadgeEarnedModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#faf9f5] border-[#e5e4de] rounded-2xl max-w-sm text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="py-4"
        >
          <div className="flex items-center justify-center gap-1 mb-4">
            <Star className="h-5 w-5 text-[#c96442]" />
            <h2 className="font-serif text-xl font-medium text-[#141413]">
              Badge{badgeTypes.length > 1 ? "s" : ""} Earned!
            </h2>
          </div>

          <div className="space-y-3 mb-6">
            {badgeTypes.map((bt, i) => {
              const config = BADGE_CONFIG[bt];
              if (!config) return null;
              return (
                <motion.div
                  key={bt}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-xl bg-white border border-[#e5e4de] p-4 flex items-center gap-4"
                >
                  <div className="text-3xl">{config.emoji}</div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#141413]">{config.label}</p>
                    <p className="text-xs text-[#87867f]">{config.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-[#c96442] hover:bg-[#b5593a] text-white"
          >
            Awesome!
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

interface XpGainIndicatorProps {
  xp: number;
  show: boolean;
}

export const XpGainIndicator = ({ xp, show }: XpGainIndicatorProps) => {
  if (!show) return null;
  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -40, opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed top-20 right-8 z-50 flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#c96442] text-white text-sm font-medium shadow-lg"
    >
      <TrendingUp className="h-4 w-4" />
      +{xp} XP
    </motion.div>
  );
};
