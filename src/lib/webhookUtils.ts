import { n8nWorkflowUtils } from "./n8nUtils";
import { toast } from "@/hooks/use-toast";

export interface WebhookTriggerOptions {
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
}

export const triggerWebhook = async (
  workflowId: string,
  options: WebhookTriggerOptions = {}
) => {
  try {
    // Fetch workflow details from database
    const workflow = await n8nWorkflowUtils.getById(workflowId);
    
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    const { webhook_url, http_method = 'POST' } = workflow;
    
    // Build URL with query parameters if provided
    const url = new URL(webhook_url);
    if (options.queryParams) {
      Object.entries(options.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Prepare request configuration
    const requestConfig: RequestInit = {
      method: http_method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add body for methods that support it
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(http_method)) {
      requestConfig.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }

    console.log(`Triggering webhook: ${http_method} ${url.toString()}`);
    
    const response = await fetch(url.toString(), requestConfig);
    
    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    const responseData = await response.text();
    
    toast({
      title: "Webhook triggered! 🎯",
      description: `Successfully executed ${workflow.name} workflow`,
    });

    return {
      success: true,
      status: response.status,
      data: responseData,
      workflow: workflow
    };
  } catch (error) {
    console.error('Webhook trigger error:', error);
    
    toast({
      title: "Webhook failed! ❌",
      description: error instanceof Error ? error.message : "Unknown error occurred",
      variant: "destructive",
    });

    throw error;
  }
};

// Legacy function for backward compatibility
export const triggerN8nWorkflow = async (
  webhookUrl: string,
  data: any = {},
  method: string = 'POST'
) => {
  const response = await fetch(webhookUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};