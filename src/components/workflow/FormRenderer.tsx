
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Send, Eye, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { N8nWorkflowWithInstance } from "@/lib/n8nUtils";
import RobotSpinner from "@/components/RobotSpinner";

interface FormField {
  name: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string; }[];
  validation?: any;
  conditional?: {
    dependsOn: string;
    showWhen: any;
  };
}

interface FormRendererProps {
  workflow: N8nWorkflowWithInstance;
  onSubmit: (data: any) => Promise<void>;
  onSaveDraft?: (data: any) => void;
  isSubmitting?: boolean;
}

const FormRenderer: React.FC<FormRendererProps> = ({
  workflow,
  onSubmit,
  onSaveDraft,
  isSubmitting = false
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [savedDraft, setSavedDraft] = useState(false);

  // Default form schema for demo - in real app, this would come from n8n workflow schema
  const formFields: FormField[] = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      validation: z.string().min(2, 'First name must be at least 2 characters')
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      validation: z.string().min(2, 'Last name must be at least 2 characters')
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      required: true,
      validation: z.string().email('Please enter a valid email address')
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      placeholder: 'Your company name',
      required: false
    },
    {
      name: 'inquiryType',
      type: 'select',
      label: 'Inquiry Type',
      required: true,
      options: [
        { value: 'general', label: 'General Inquiry' },
        { value: 'support', label: 'Technical Support' },
        { value: 'sales', label: 'Sales Question' },
        { value: 'partnership', label: 'Partnership' }
      ],
      validation: z.string().min(1, 'Please select an inquiry type')
    },
    {
      name: 'priority',
      type: 'select',
      label: 'Priority Level',
      required: true,
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ],
      conditional: {
        dependsOn: 'inquiryType',
        showWhen: 'support'
      },
      validation: z.string().min(1, 'Please select a priority level')
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      placeholder: 'Please provide details about your inquiry...',
      required: true,
      validation: z.string().min(10, 'Message must be at least 10 characters')
    },
    {
      name: 'newsletter',
      type: 'checkbox',
      label: 'Subscribe to our newsletter',
      required: false
    }
  ];

  // Create dynamic schema based on form fields
  const createSchema = () => {
    const schemaFields: Record<string, any> = {};
    formFields.forEach(field => {
      if (field.validation) {
        schemaFields[field.name] = field.validation;
      } else {
        schemaFields[field.name] = field.required ? z.string().min(1) : z.string().optional();
      }
    });
    return z.object(schemaFields);
  };

  const form = useForm({
    resolver: zodResolver(createSchema()),
    defaultValues: {},
    mode: 'onChange'
  });

  const watchedValues = form.watch();

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      if (onSaveDraft && Object.keys(watchedValues).length > 0) {
        onSaveDraft(watchedValues);
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 2000);
      }
    }, 3000);

    setAutoSaveTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [watchedValues, onSaveDraft]);

  // Check if field should be visible based on conditional logic
  const isFieldVisible = (field: FormField): boolean => {
    if (!field.conditional) return true;
    const dependentValue = watchedValues[field.conditional.dependsOn];
    return dependentValue === field.conditional.showWhen;
  };

  // Get visible fields for current step
  const getVisibleFields = (): FormField[] => {
    return formFields.filter(isFieldVisible);
  };

  // Calculate form progress
  const getProgress = (): number => {
    const visibleFields = getVisibleFields();
    const filledFields = visibleFields.filter(field => {
      const value = watchedValues[field.name];
      return value && value !== '';
    });
    return visibleFields.length > 0 ? (filledFields.length / visibleFields.length) * 100 : 0;
  };

  // AI-assisted autofill suggestions (mock implementation)
  const getAISuggestions = (fieldName: string): string[] => {
    const suggestions: Record<string, string[]> = {
      company: ['Deutsche Telekom', 'T-Mobile', 'T-Systems', 'Telekom Deutschland'],
      inquiryType: ['Technical Support', 'Sales Question'],
      message: ['I need help with...', 'I would like to inquire about...', 'Could you please assist me with...']
    };
    return suggestions[fieldName] || [];
  };

  const handleSubmit = async (data: any) => {
    if (previewMode) {
      setPreviewMode(false);
      return;
    }
    await onSubmit(data);
  };

  const renderField = (field: FormField) => {
    const suggestions = getAISuggestions(field.name);
    
    return (
      <motion.div
        key={field.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {suggestions.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-primary hover:text-primary/80"
              onClick={() => {
                // Mock AI suggestion - in real app, this would be more sophisticated
                form.setValue(field.name, suggestions[0]);
              }}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              AI Suggest
            </Button>
          )}
        </div>

        <Controller
          control={form.control}
          name={field.name}
          render={({ field: formField, fieldState }) => {
            switch (field.type) {
              case 'text':
              case 'email':
              case 'number':
                return (
                  <div>
                    <Input
                      {...formField}
                      type={field.type}
                      placeholder={field.placeholder}
                      className={`form-control transition-all duration-200 ${
                        fieldState.error 
                          ? 'border-destructive focus:border-destructive' 
                          : 'focus:border-primary focus:ring-primary'
                      }`}
                      aria-describedby={fieldState.error ? `${field.name}-error` : undefined}
                    />
                    {fieldState.error && (
                      <p id={`${field.name}-error`} className="text-sm text-destructive mt-1 flex items-center" role="alert">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                );

              case 'textarea':
                return (
                  <div>
                    <Textarea
                      {...formField}
                      placeholder={field.placeholder}
                      rows={4}
                      className={`form-control transition-all duration-200 ${
                        fieldState.error 
                          ? 'border-destructive focus:border-destructive' 
                          : 'focus:border-primary focus:ring-primary'
                      }`}
                      aria-describedby={fieldState.error ? `${field.name}-error` : undefined}
                    />
                    {fieldState.error && (
                      <p id={`${field.name}-error`} className="text-sm text-destructive mt-1 flex items-center" role="alert">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                );

              case 'select':
                return (
                  <div>
                    <Select value={formField.value} onValueChange={formField.onChange}>
                      <SelectTrigger className={`form-control ${
                        fieldState.error 
                          ? 'border-destructive focus:border-destructive' 
                          : 'focus:border-primary focus:ring-primary'
                      }`}>
                        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && (
                      <p id={`${field.name}-error`} className="text-sm text-destructive mt-1 flex items-center" role="alert">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {fieldState.error.message}
                      </p>
                    )}
                  </div>
                );

              case 'checkbox':
                return (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={field.name}
                      checked={formField.value || false}
                      onCheckedChange={formField.onChange}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor={field.name} className="text-sm font-normal cursor-pointer">
                      {field.label}
                    </Label>
                  </div>
                );

              default:
                return null;
            }
          }}
        />
      </motion.div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{workflow.name}</span>
              <Badge variant="secondary" className="text-xs">
                Form Workflow
              </Badge>
            </CardTitle>
            <CardDescription>
              {workflow.description || 'Complete this form to trigger the workflow'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {savedDraft && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center text-sm text-muted-foreground"
              >
                <Save className="h-4 w-4 mr-1" />
                Draft saved
              </motion.div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center space-x-1"
            >
              <Eye className="h-4 w-4" />
              <span>{previewMode ? 'Edit' : 'Preview'}</span>
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(getProgress())}% complete</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Integration Preview */}
        <Alert className="border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            This form triggers: <strong>{workflow.name}</strong> on {workflow.n8n_instances.name}
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {previewMode ? (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-medium text-sm text-muted-foreground">Form Preview</h3>
              {getVisibleFields().map(field => {
                const value = watchedValues[field.name];
                if (!value) return null;
                
                return (
                  <div key={field.name} className="flex justify-between py-2 border-b border-border/50">
                    <span className="font-medium text-sm">{field.label}:</span>
                    <span className="text-sm text-muted-foreground">
                      {field.type === 'checkbox' ? (value ? 'Yes' : 'No') : value}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <div className="space-y-6">
                {getVisibleFields().map(renderField)}
              </div>
            </AnimatePresence>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              {form.formState.isValid && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center text-sm text-success"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Form is valid
                </motion.div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {onSaveDraft && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSaveDraft(watchedValues)}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={isSubmitting || (!previewMode && !form.formState.isValid)}
                className="btn-primary flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <RobotSpinner />
                ) : previewMode ? (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Back to Edit</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Form</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FormRenderer;
