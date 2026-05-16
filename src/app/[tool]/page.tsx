import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ColorTools from '../components/color/ColorTools';
import PaletteGenerator from '../components/palette/PaletteGenerator';
import GradientGenerator from '../components/gradient/GradientGenerator';
import CreateFlow from '../components/create/CreateFlow';
import SignIn from '../components/auth/SignIn';
import SignUp from '../components/auth/SignUp';

// Component Mapping
const TOOL_COMPONENTS: Record<string, React.ReactNode> = {
  color: <ColorTools />,
  palette: <PaletteGenerator />,
  gradient: <GradientGenerator />,
  create: <CreateFlow />,
  signin: <SignIn />,
  signup: <SignUp />,
};

// Metadata Mapping
const TOOL_METADATA: Record<string, Metadata> = {
  color: {
    title: "Color Converter | HueSurge",
    description: "Convert Hex, RGB, HSL values and check accessibility contrast ratios.",
  },
  palette: {
    title: "Palette Generator | HueSurge",
    description: "Generate beautiful, harmonious color palettes for your web projects.",
  },
  gradient: {
    title: "Gradient Tool | HueSurge",
    description: "Create and export linear and radial CSS gradients.",
  },
  create: {
    title: "Create Palette | HueSurge",
    description: "Design your perfect color palette with our step-by-step creator.",
  },
  signin: {
    title: "Sign In | HueSurge",
    description: "Sign in to your HueSurge account.",
  },
  signup: {
    title: "Sign Up | HueSurge",
    description: "Create a new HueSurge account.",
  },
};

interface PageProps {
  params: Promise<{ tool: string }>;
}

export async function generateStaticParams() {
  return [
    { tool: 'color' },
    { tool: 'palette' },
    { tool: 'gradient' },
    { tool: 'create' },
    { tool: 'signin' },
    { tool: 'signup' },
  ];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tool } = await params;
  return TOOL_METADATA[tool] || {
    title: "HueSurge Tool",
    description: "Professional color tool for developers.",
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { tool } = await params;
  const component = TOOL_COMPONENTS[tool];

  if (!component) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {component}
    </Suspense>
  );
}
