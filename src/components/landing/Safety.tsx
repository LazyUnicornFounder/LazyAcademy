import { ShieldCheck, Eye, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const safeguards = [
  {
    icon: ShieldCheck,
    title: "AI Content Moderation",
    desc: "Every lesson is reviewed by a dedicated AI safety layer that checks for age-appropriateness before your child sees it.",
  },
  {
    icon: Eye,
    title: "Parent Preview",
    desc: "Preview every lesson before your child starts. Don't like something? Regenerate it with one tap.",
  },
  {
    icon: AlertTriangle,
    title: "Content Reporting",
    desc: "Flag any lesson that doesn't feel right. Our team reviews reports and improves the system continuously.",
  },
  {
    icon: RefreshCw,
    title: "Age-Adapted Rules",
    desc: "Content rules change by age group — a 4-year-old and a 12-year-old get very different language, topics, and complexity.",
  },
];

const Safety = () => {
  return (
    <section id="safety" className="py-24">
      <div className="container">
        <h2 className="text-center text-2xl md:text-3xl text-foreground mb-4">
          Built with safety first
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Every piece of content is moderated, age-checked, and parent-reviewable before it reaches your child.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {safeguards.map((s) => (
            <Card key={s.title} className="rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <CardContent className="p-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Safety;
