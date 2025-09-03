import { EnhancedReadabilityService, defaultReadabilitySettings, type ReadabilitySettings } from './enhanced-readability-service';

export interface ComponentReadabilityAnalysis {
  component: 'hook' | 'micro-hook' | 'bridge' | 'golden-nugget' | 'cta';
  text: string;
  readabilityScore: number;
  gradeLevel: string;
  gradeNumeric: number;
  complexity: 'elementary' | 'middle-school' | 'high-school' | 'college' | 'graduate';
  sentenceLength: {
    average: number;
    longest: number;
    shortest: number;
  };
  wordComplexity: {
    simple: number;
    complex: number;
    percentage: number;
  };
  suggestions: string[];
  issues: string[];
}

export interface ScriptReadabilityAnalysis {
  overall: ComponentReadabilityAnalysis;
  components: ComponentReadabilityAnalysis[];
  averageGradeLevel: string;
  averageGradeNumeric: number;
  mostComplex: ComponentReadabilityAnalysis;
  leastComplex: ComponentReadabilityAnalysis;
  recommendations: string[];
  passesThirdGradeTest: boolean;
  componentStats: {
    elementary: number;
    middleSchool: number;
    highSchool: number;
    college: number;
    graduate: number;
  };
}

interface ParsedScriptComponent {
  type: 'hook' | 'micro-hook' | 'bridge' | 'golden-nugget' | 'cta';
  text: string;
  startIndex: number;
  endIndex: number;
}

export class ComponentReadabilityService {
  private readabilityService: EnhancedReadabilityService;

  constructor(settings: ReadabilitySettings = defaultReadabilitySettings) {
    this.readabilityService = new EnhancedReadabilityService(settings);
  }

  /**
   * Analyze a complete script with markdown headings for readability at component level
   */
  analyzeScriptComponents(scriptText: string): ScriptReadabilityAnalysis {
    const components = this.parseScriptComponents(scriptText);
    const componentAnalyses: ComponentReadabilityAnalysis[] = [];

    // Analyze each component individually
    for (const component of components) {
      const analysis = this.analyzeComponent(component);
      componentAnalyses.push(analysis);
    }

    // Create overall analysis (full script minus headings)
    const contentOnly = this.extractContentOnly(scriptText);
    const overallComponent: ParsedScriptComponent = {
      type: 'hook', // placeholder
      text: contentOnly,
      startIndex: 0,
      endIndex: contentOnly.length,
    };
    const overall = this.analyzeComponent(overallComponent);
    overall.component = 'hook'; // Reset to indicate overall

    // Calculate aggregate stats
    const gradeNumbers = componentAnalyses.map(c => c.gradeNumeric).filter(n => n > 0);
    const averageGradeNumeric = gradeNumbers.length > 0 
      ? gradeNumbers.reduce((sum, grade) => sum + grade, 0) / gradeNumbers.length
      : 0;

    const mostComplex = componentAnalyses.reduce((prev, current) => 
      (current.gradeNumeric > prev.gradeNumeric) ? current : prev
    );

    const leastComplex = componentAnalyses.reduce((prev, current) => 
      (current.gradeNumeric < prev.gradeNumeric && current.gradeNumeric > 0) ? current : prev
    );

    // Component complexity distribution
    const componentStats = {
      elementary: componentAnalyses.filter(c => c.complexity === 'elementary').length,
      middleSchool: componentAnalyses.filter(c => c.complexity === 'middle-school').length,
      highSchool: componentAnalyses.filter(c => c.complexity === 'high-school').length,
      college: componentAnalyses.filter(c => c.complexity === 'college').length,
      graduate: componentAnalyses.filter(c => c.complexity === 'graduate').length,
    };

    return {
      overall,
      components: componentAnalyses,
      averageGradeLevel: this.numericToGradeLabel(averageGradeNumeric),
      averageGradeNumeric,
      mostComplex,
      leastComplex,
      recommendations: this.generateScriptRecommendations(componentAnalyses),
      passesThirdGradeTest: averageGradeNumeric <= 3,
      componentStats,
    };
  }

  /**
   * Parse script text with markdown headings into components
   */
  private parseScriptComponents(scriptText: string): ParsedScriptComponent[] {
    const components: ParsedScriptComponent[] = [];
    const sections = scriptText.split(/\*\*([^:]+):\*\*/);
    
    let currentIndex = 0;
    for (let i = 1; i < sections.length; i += 2) {
      const heading = sections[i].toLowerCase().trim();
      const content = sections[i + 1]?.trim() || '';
      
      if (!content) continue;

      const componentType = this.mapHeadingToComponentType(heading);
      if (componentType) {
        components.push({
          type: componentType,
          text: content,
          startIndex: currentIndex,
          endIndex: currentIndex + content.length,
        });
        currentIndex += content.length;
      }
    }

    return components;
  }

  /**
   * Map heading text to component type
   */
  private mapHeadingToComponentType(heading: string): ParsedScriptComponent['type'] | null {
    const normalizedHeading = heading.toLowerCase().replace(/\s+/g, ' ').trim();
    
    if (normalizedHeading.includes('hook') && !normalizedHeading.includes('micro')) {
      return 'hook';
    }
    if (normalizedHeading.includes('micro hook')) {
      return 'micro-hook';
    }
    if (normalizedHeading.includes('bridge')) {
      return 'bridge';
    }
    if (normalizedHeading.includes('golden nugget') || normalizedHeading.includes('nugget')) {
      return 'golden-nugget';
    }
    if (normalizedHeading.includes('call to action') || normalizedHeading.includes('cta')) {
      return 'cta';
    }
    
    return null;
  }

  /**
   * Extract content only (remove headings) for overall analysis
   */
  private extractContentOnly(scriptText: string): string {
    return scriptText
      .replace(/\*\*[^:]+:\*\*/g, '') // Remove **Heading:** patterns
      .replace(/\n\s*\n/g, ' ') // Replace double newlines with space
      .trim();
  }

  /**
   * Analyze individual component for readability
   */
  private analyzeComponent(component: ParsedScriptComponent): ComponentReadabilityAnalysis {
    const text = component.text.trim();
    
    if (!text) {
      return this.createEmptyAnalysis(component.type);
    }

    // Use existing readability service
    const readabilityAnalysis = this.readabilityService.analyzeText(text);
    const gradeNumeric = this.gradeToNumeric(readabilityAnalysis.overall.gradeLevel);

    // Calculate sentence length stats
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    
    const sentenceLength = {
      average: sentenceLengths.length > 0 
        ? Math.round(sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length * 10) / 10
        : 0,
      longest: Math.max(...sentenceLengths, 0),
      shortest: Math.min(...sentenceLengths, 0),
    };

    // Calculate word complexity
    const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 0);
    const complexWords = words.filter(w => this.countSyllables(w) >= 3);
    
    const wordComplexity = {
      simple: words.length - complexWords.length,
      complex: complexWords.length,
      percentage: words.length > 0 ? Math.round((complexWords.length / words.length) * 100) : 0,
    };

    return {
      component: component.type,
      text,
      readabilityScore: readabilityAnalysis.overall.score,
      gradeLevel: readabilityAnalysis.overall.gradeLevel,
      gradeNumeric,
      complexity: this.determineComplexityLevel(gradeNumeric),
      sentenceLength,
      wordComplexity,
      suggestions: this.generateComponentSuggestions(component.type, readabilityAnalysis, gradeNumeric),
      issues: readabilityAnalysis.sentences.flatMap(s => s.issues),
    };
  }

  /**
   * Create empty analysis for missing components
   */
  private createEmptyAnalysis(componentType: ParsedScriptComponent['type']): ComponentReadabilityAnalysis {
    return {
      component: componentType,
      text: '',
      readabilityScore: 0,
      gradeLevel: 'N/A',
      gradeNumeric: 0,
      complexity: 'elementary',
      sentenceLength: { average: 0, longest: 0, shortest: 0 },
      wordComplexity: { simple: 0, complex: 0, percentage: 0 },
      suggestions: [`Add ${componentType.replace('-', ' ')} content to analyze readability`],
      issues: [],
    };
  }

  /**
   * Convert grade level string to numeric value
   */
  private gradeToNumeric(gradeLevel: string): number {
    if (!gradeLevel || gradeLevel === 'N/A') return 0;
    
    const grade = gradeLevel.toLowerCase();
    if (grade.includes('5th')) return 5;
    if (grade.includes('6th')) return 6;
    if (grade.includes('7th')) return 7;
    if (grade.includes('8th') || grade.includes('9th')) return 8.5;
    if (grade.includes('10th') || grade.includes('12th') || grade.includes('high school')) return 11;
    if (grade.includes('college')) return 14;
    if (grade.includes('graduate')) return 17;
    
    // Try to extract number
    const match = grade.match(/(\d+)/);
    if (match) return parseInt(match[1]);
    
    return 12; // Default to high school level
  }

  /**
   * Convert numeric grade to label
   */
  private numericToGradeLabel(grade: number): string {
    if (grade < 1) return "K";
    if (grade === 1) return "1st Grade";
    if (grade === 2) return "2nd Grade";
    if (grade === 3) return "3rd Grade";
    if (grade <= 12) return `${Math.round(grade)}th Grade`;
    if (grade <= 16) return "College Level";
    return "Graduate Level";
  }

  /**
   * Determine complexity level from numeric grade
   */
  private determineComplexityLevel(gradeNumeric: number): ComponentReadabilityAnalysis['complexity'] {
    if (gradeNumeric <= 6) return 'elementary';
    if (gradeNumeric <= 9) return 'middle-school';
    if (gradeNumeric <= 12) return 'high-school';
    if (gradeNumeric <= 16) return 'college';
    return 'graduate';
  }

  /**
   * Generate component-specific suggestions
   */
  private generateComponentSuggestions(
    componentType: ParsedScriptComponent['type'], 
    analysis: any, 
    gradeNumeric: number
  ): string[] {
    const suggestions: string[] = [];

    // General readability suggestions
    if (gradeNumeric > 8) {
      suggestions.push("Consider simpler language for broader audience appeal");
    }

    if (gradeNumeric > 12) {
      suggestions.push("Too complex - risk losing viewer attention");
    }

    // Component-specific suggestions
    switch (componentType) {
      case 'hook':
        if (gradeNumeric > 6) {
          suggestions.push("Hooks should be simple and instantly understandable");
        }
        if (analysis.statistics.averageWordsPerSentence > 12) {
          suggestions.push("Keep hook sentences short and punchy");
        }
        break;

      case 'micro-hook':
        if (gradeNumeric > 5) {
          suggestions.push("Micro hooks should be extremely simple and intriguing");
        }
        break;

      case 'bridge':
        if (gradeNumeric > 8) {
          suggestions.push("Bridge should smoothly connect ideas with simple language");
        }
        break;

      case 'golden-nugget':
        if (gradeNumeric > 10) {
          suggestions.push("Main content can be slightly more complex but should remain accessible");
        }
        break;

      case 'cta':
        if (gradeNumeric > 6) {
          suggestions.push("Call to action should be simple and direct");
        }
        break;
    }

    // Add sentence-specific issues
    if (analysis.statistics.averageWordsPerSentence > 20) {
      suggestions.push("Break up long sentences");
    }

    if (analysis.statistics.complexWords / analysis.statistics.totalWords > 0.15) {
      suggestions.push("Replace complex words with simpler alternatives");
    }

    return suggestions.length > 0 ? suggestions : ["Good readability for this component"];
  }

  /**
   * Generate overall script recommendations
   */
  private generateScriptRecommendations(components: ComponentReadabilityAnalysis[]): string[] {
    const recommendations: string[] = [];

    const avgGrade = components.reduce((sum, c) => sum + c.gradeNumeric, 0) / components.length;

    if (avgGrade > 8) {
      recommendations.push("Overall script complexity is high - consider simplifying language");
    }

    if (avgGrade <= 3) {
      recommendations.push("Excellent! Script is very accessible to broad audiences");
    }

    // Check for consistency
    const grades = components.map(c => c.gradeNumeric).filter(g => g > 0);
    const maxGrade = Math.max(...grades);
    const minGrade = Math.min(...grades);

    if (maxGrade - minGrade > 6) {
      recommendations.push("Large complexity gap between components - consider balancing difficulty");
    }

    return recommendations;
  }

  /**
   * Count syllables in a word (reuse from enhanced service)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = "aeiouy";
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Handle silent 'e'
    if (word.endsWith("e") && syllableCount > 1) {
      syllableCount--;
    }

    return Math.max(1, syllableCount);
  }
}
