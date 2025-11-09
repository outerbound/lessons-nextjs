// app/test/page.tsx
import * as esbuild from 'esbuild';
import JSXRenderer from './jsxrenderer';

const tsxFromLLM = `
import React, { useState } from 'react';

interface PizzaStep {
  title: string;
  description: string;
  emoji: string;
}

interface PizzaMakingGuideProps {}

const PizzaMakingGuide: React.FC<PizzaMakingGuideProps> = () => {
  const pizzaSteps: PizzaStep[] = [
    {
      title: "1. Gather Your Arsenal! 🍕",
      description: "Round up all your ingredients: flour, yeast, sugar, salt, olive oil, water, tomato sauce, mozzarella, and your favorite toppings. Don't forget your trusty mixing bowl and baking sheet!",
      emoji: "🛒"
    },
    {
      title: "2. Doughy Dreams Begin! 💫",
      description: "In a bowl, mix warm water, yeast, and a pinch of sugar. Let it sit for 5-10 minutes until it gets foamy – that's your yeast waking up! Then, stir in flour, salt, and olive oil.",
      emoji: "🧪"
    },
    {
      title: "3. Knead It Like a Pro! 💪",
      description: "Transfer the shaggy dough to a lightly floured surface. Now, it's workout time! Knead for 8-10 minutes until it's smooth, elastic, and feels like a baby's bottom. Trust us, it's therapeutic!",
      emoji: "🖐️"
    },
    {
      title: "4. Rise and Shine, Dough! ☀️",
      description: "Lightly oil a clean bowl, place your dough ball inside, and turn to coat. Cover with a kitchen towel or plastic wrap. Let it chill out in a warm spot for 1-1.5 hours, or until it doubles in size. It's growing!",
      emoji: "🛌"
    },
    {
      title: "5. Oven's On & Topping Prep! 🔥",
      description: "Time to preheat your oven to a sizzling 450-500°F (230-260°C) with a pizza stone or baking steel inside if you have one. Chop all your amazing toppings – pepperoni, veggies, pineapple (if you dare!).",
      emoji: "🔪"
    },
    {
      title: "6. Shape Your Masterpiece! 🎨",
      description: "Gently punch down the risen dough and transfer it to a lightly floured surface. Stretch, pat, or even do a little pizza toss (carefully!) until you have a beautiful 12-14 inch circle. Don't worry if it's not perfect!",
      emoji: "⭕"
    },
    {
      title: "7. The Flavor Layering Begins! 🍅🧀🌶️",
      description: "Transfer your dough to a sheet of parchment paper. Spread your favorite tomato sauce evenly, leaving a small crust edge. Sprinkle generously with mozzarella and artfully arrange your chosen toppings.",
      emoji: "🖌️"
    },
    {
      title: "8. Bake Until Golden & Bubbly! ✨",
      description: "Carefully slide your pizza (with parchment paper) onto your hot pizza stone or baking sheet. Bake for 10-15 minutes, or until the crust is golden brown and the cheese is melted and bubbly. Mmm, the smell!",
      emoji: "🌡️"
    },
    {
      title: "9. Slice, Serve & Celebrate! 🎉",
      description: "Carefully remove your glorious pizza from the oven. Let it cool for a few minutes (patience, young padawan!). Slice it up, grab a piece, and bask in the glory of your homemade pizza triumph! Enjoy every bite!",
      emoji: "🥳"
    }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentStep: PizzaStep = pizzaSteps[currentStepIndex];

  const handleNextStep = (): void => {
    setCurrentStepIndex((prevIndex) => Math.min(prevIndex + 1, pizzaSteps.length - 1));
  };

  const handlePreviousStep = (): void => {
    setCurrentStepIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleStartOver = (): void => {
    setCurrentStepIndex(0);
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    maxWidth: '600px',
    margin: '40px auto',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  };

  const titleStyle: React.CSSProperties = {
    color: '#D32F2F',
    fontSize: '2.5em',
    marginBottom: '15px',
    fontWeight: '700',
    textShadow: '1px 1px 2px rgba(0,0,0,0.05)'
  };

  const stepCardStyle: React.CSSProperties = {
    backgroundColor: '#FFFDE7',
    padding: '25px',
    borderRadius: '10px',
    border: '2px dashed #FFCC80',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
  };

  const stepTitleStyle: React.CSSProperties = {
    color: '#333',
    fontSize: '1.8em',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  };

  const stepDescriptionStyle: React.CSSProperties = {
    color: '#555',
    fontSize: '1.1em',
    lineHeight: '1.6',
    marginBottom: '10px'
  };

  const emojiStyle: React.CSSProperties = {
    fontSize: '1.8em',
    marginRight: '8px'
  };

  const progressBarStyle: React.CSSProperties = {
    height: '10px',
    backgroundColor: '#E0E0E0',
    borderRadius: '5px',
    marginBottom: '20px',
    overflow: 'hidden'
  };

  const progressBarFillStyle: React.CSSProperties = {
    width: \`\${((currentStepIndex + 1) / pizzaSteps.length) * 100}%\`,
    height: '100%',
    backgroundColor: '#FF7043',
    borderRadius: '5px',
    transition: 'width 0.4s ease-in-out'
  };

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px',
    marginTop: '20px'
  };

  const buttonBaseStyle: React.CSSProperties = {
    padding: '12px 25px',
    fontSize: '1.1em',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease, transform 0.1s ease-out',
    flexGrow: 1,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#4CAF50',
    color: '#fff',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#FFEB3B',
    color: '#333',
  };

  const resetButtonPrimaryStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: '#F44336',
    color: '#fff',
  };

  const disabledButtonStyle: React.CSSProperties = {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none'
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '30px',
    fontSize: '0.9em',
    color: '#888'
  };

  const currentStepNumberStyle: React.CSSProperties = {
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '15px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Homemade Pizza Adventure! 🚀</h1>

      <div style={progressBarStyle}>
        <div style={progressBarFillStyle}></div>
      </div>

      <p style={currentStepNumberStyle}>
        Step {currentStepIndex + 1} of {pizzaSteps.length}
      </p>

      <div style={stepCardStyle}>
        <h2 style={stepTitleStyle}>
          <span style={emojiStyle}>{currentStep.emoji}</span>
          {currentStep.title}
        </h2>
        <p style={stepDescriptionStyle}>{currentStep.description}</p>
      </div>

      <div style={buttonGroupStyle}>
        <button
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
          style={currentStepIndex === 0 ? { ...secondaryButtonStyle, ...disabledButtonStyle } : secondaryButtonStyle}
        >
          ⏪ Previous
        </button>
        {currentStepIndex < pizzaSteps.length - 1 ? (
          <button
            onClick={handleNextStep}
            style={primaryButtonStyle}
          >
            Next Step! 👉
          </button>
        ) : (
          <button
            onClick={handleStartOver}
            style={resetButtonPrimaryStyle}
          >
            Start Over! 🎉
          </button>
        )}
      </div>

      <p style={footerStyle}>
        Get ready to become a pizza master! Buon Appetito!
      </p>
    </div>
  ) as JSX.Element;
};

export default PizzaMakingGuide;
`;

export default async function Page() {
  const { jsx } = await compileTSXToJSX(tsxFromLLM);
  return <JSXRenderer code={jsx} />;
}


export async function compileTSXToJSX(tsx: string) {
  const result = await esbuild.transform(tsx, {
    loader: 'tsx',
    jsx: 'transform',
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
  });

  return { jsx: result.code };
}