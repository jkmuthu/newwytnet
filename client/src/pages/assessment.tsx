import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

interface AssessmentCategory {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

interface AssessmentOption {
  id: string;
  optionText: string;
  optionValue: number;
  discType: string;
}

interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  discType: string;
  options: AssessmentOption[];
}

interface AssessmentSession {
  id: string;
  participantName: string;
  participantEmail?: string;
  age?: number;
  gender?: string;
  country?: string;
  city?: string;
  categoryId?: string;
  language: string;
  isCompleted: boolean;
}

type AssessmentStep = 'info' | 'assessment' | 'results';

export default function Assessment() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('info');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [participantInfo, setParticipantInfo] = useState({
    participantName: '',
    participantEmail: '',
    age: '',
    gender: '',
    country: '',
    city: '',
    categoryId: '',
    language: 'en'
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/assessments/categories'],
    retry: false,
  });

  // Fetch questions
  const { data: questions, isLoading: loadingQuestions } = useQuery({
    queryKey: ['/api/assessments/questions', participantInfo.categoryId || null, participantInfo.language],
    enabled: currentStep === 'assessment' && !!sessionId,
    retry: false,
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest("POST", "/api/assessments/sessions", sessionData);
      return await response.json();
    },
    onSuccess: (session: AssessmentSession) => {
      setSessionId(session.id);
      setCurrentStep('assessment');
      toast({
        title: "Assessment Started",
        description: "Let's begin your DISC personality assessment!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (responseData: any) => {
      const response = await apiRequest("POST", "/api/assessments/responses", responseData);
      return await response.json();
    },
    onSuccess: () => {
      if (currentQuestionIndex < (questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered, calculate results
        calculateResults();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate results mutation
  const calculateResultsMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await apiRequest("POST", `/api/assessments/sessions/${sessionId}/calculate`);
      return await response.json();
    },
    onSuccess: () => {
      setCurrentStep('results');
      toast({
        title: "Assessment Complete!",
        description: "Your DISC personality results are ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get results query
  const { data: results, isLoading: loadingResults } = useQuery({
    queryKey: [`/api/assessments/sessions/${sessionId}/results`],
    enabled: currentStep === 'results' && !!sessionId,
    retry: false,
  });

  const handleStartAssessment = () => {
    if (!participantInfo.participantName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    const sessionData = {
      ...participantInfo,
      age: participantInfo.age ? parseInt(participantInfo.age) : undefined,
    };

    createSessionMutation.mutate(sessionData);
  };

  const handleQuestionResponse = (optionId: string) => {
    if (!questions || !questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const selectedOption = question.options.find(opt => opt.id === optionId);
    
    if (!selectedOption) return;

    const responseData = {
      sessionId,
      questionId: question.id,
      optionId: selectedOption.id,
      responseValue: selectedOption.optionValue,
    };

    setResponses(prev => ({
      ...prev,
      [question.id]: optionId
    }));

    submitResponseMutation.mutate(responseData);
  };

  const calculateResults = () => {
    calculateResultsMutation.mutate(sessionId);
  };

  const currentQuestion = questions?.[currentQuestionIndex];
  const progress = questions ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const getDiscTypeColor = (type: string) => {
    const colors = {
      D: 'bg-red-500',
      I: 'bg-yellow-500', 
      S: 'bg-green-500',
      C: 'bg-blue-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getDiscTypeName = (type: string) => {
    const names = {
      D: 'Dominance',
      I: 'Influence',
      S: 'Steadiness',
      C: 'Conscientiousness'
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">AssessDisc</h1>
            <p className="text-xl text-muted-foreground">
              Discover your DISC personality type and unlock insights about your work style, 
              communication preferences, and career potential.
            </p>
          </div>

          {currentStep === 'info' && (
            <Card className="w-full max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <p className="text-muted-foreground">
                  Tell us a bit about yourself to get personalized insights.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      data-testid="input-participant-name"
                      value={participantInfo.participantName}
                      onChange={(e) => setParticipantInfo(prev => ({
                        ...prev,
                        participantName: e.target.value
                      }))}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      data-testid="input-participant-email"
                      type="email"
                      value={participantInfo.participantEmail}
                      onChange={(e) => setParticipantInfo(prev => ({
                        ...prev,
                        participantEmail: e.target.value
                      }))}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age (Optional)</Label>
                    <Input
                      id="age"
                      data-testid="input-participant-age"
                      type="number"
                      value={participantInfo.age}
                      onChange={(e) => setParticipantInfo(prev => ({
                        ...prev,
                        age: e.target.value
                      }))}
                      placeholder="25"
                      min="16"
                      max="100"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender (Optional)</Label>
                    <Select
                      value={participantInfo.gender}
                      onValueChange={(value) => setParticipantInfo(prev => ({
                        ...prev,
                        gender: value
                      }))}
                    >
                      <SelectTrigger data-testid="select-gender">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non-binary">Non-binary</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="country">Country (Optional)</Label>
                    <Input
                      id="country"
                      data-testid="input-country"
                      value={participantInfo.country}
                      onChange={(e) => setParticipantInfo(prev => ({
                        ...prev,
                        country: e.target.value
                      }))}
                      placeholder="United States"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city">City (Optional)</Label>
                    <Input
                      id="city"
                      data-testid="input-city"
                      value={participantInfo.city}
                      onChange={(e) => setParticipantInfo(prev => ({
                        ...prev,
                        city: e.target.value
                      }))}
                      placeholder="New York"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">I am a... (Optional)</Label>
                  <Select
                    value={participantInfo.categoryId}
                    onValueChange={(value) => setParticipantInfo(prev => ({
                      ...prev,
                      categoryId: value
                    }))}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: AssessmentCategory) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleStartAssessment} 
                  className="w-full"
                  data-testid="button-start-assessment"
                  disabled={createSessionMutation.isPending}
                >
                  {createSessionMutation.isPending ? 'Starting...' : 'Start Assessment'}
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 'assessment' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1} of {questions?.length || 0}
                  </Badge>
                  <Badge variant="outline" className={getDiscTypeColor(currentQuestion?.discType || '')}>
                    {getDiscTypeName(currentQuestion?.discType || '')}
                  </Badge>
                </div>
                <Progress value={progress} className="w-full mb-6" />
              </div>

              {loadingQuestions ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading questions...</p>
                  </CardContent>
                </Card>
              ) : currentQuestion ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {currentQuestion.questionText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={responses[currentQuestion.id] || ''}
                      onValueChange={handleQuestionResponse}
                      className="space-y-4"
                    >
                      {currentQuestion.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                          <RadioGroupItem 
                            value={option.id} 
                            id={option.id}
                            data-testid={`option-${option.id}`}
                          />
                          <Label 
                            htmlFor={option.id} 
                            className="flex-1 cursor-pointer"
                          >
                            {option.optionText}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No questions available.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 'results' && (
            <div className="space-y-6">
              {loadingResults ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Calculating your results...</p>
                  </CardContent>
                </Card>
              ) : results?.result ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl text-center">
                        Your DISC Personality Type
                      </CardTitle>
                      <div className="text-center">
                        <Badge className={`text-lg px-4 py-2 ${getDiscTypeColor(results.result.primaryType)}`}>
                          {getDiscTypeName(results.result.primaryType)} ({results.result.primaryType})
                        </Badge>
                        {results.result.secondaryType && (
                          <Badge variant="outline" className="ml-2">
                            Secondary: {getDiscTypeName(results.result.secondaryType)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { type: 'D', label: 'Dominance', score: results.result.dominanceScore },
                      { type: 'I', label: 'Influence', score: results.result.influenceScore },
                      { type: 'S', label: 'Steadiness', score: results.result.steadinessScore },
                      { type: 'C', label: 'Conscientiousness', score: results.result.conscientiousnessScore },
                    ].map(({ type, label, score }) => (
                      <Card key={type}>
                        <CardContent className="p-4 text-center">
                          <div className={`w-16 h-16 rounded-full ${getDiscTypeColor(type)} mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold`}>
                            {type}
                          </div>
                          <h3 className="font-semibold">{label}</h3>
                          <p className="text-2xl font-bold text-primary">{score}%</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {results.result.personalityProfile && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Personality Profile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(results.result.personalityProfile).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <h4 className="font-semibold capitalize">
                                {key}: {value.score}%
                              </h4>
                              <p className="text-muted-foreground">{value.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {results.result.strengths && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Strengths</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {results.result.strengths.map((strength: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {results.result.recommendations && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Career Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {results.result.recommendations.primary && (
                            <div>
                              <h4 className="font-semibold">Career Paths:</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {results.result.recommendations.primary.career?.map((career: string, index: number) => (
                                  <Badge key={index} variant="outline">
                                    {career}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {results.result.recommendations.combinedAdvice && (
                            <div>
                              <h4 className="font-semibold">Combined Advice:</h4>
                              <p className="text-muted-foreground mt-2">
                                {results.result.recommendations.combinedAdvice}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="text-center space-y-4">
                    <Button 
                      onClick={() => window.print()} 
                      variant="outline"
                      data-testid="button-print-results"
                    >
                      Print Results
                    </Button>
                    <Button 
                      onClick={() => {
                        setCurrentStep('info');
                        setSessionId('');
                        setCurrentQuestionIndex(0);
                        setResponses({});
                        setParticipantInfo({
                          participantName: '',
                          participantEmail: '',
                          age: '',
                          gender: '',
                          country: '',
                          city: '',
                          categoryId: '',
                          language: 'en'
                        });
                      }}
                      data-testid="button-take-another"
                    >
                      Take Another Assessment
                    </Button>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Unable to load results.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}