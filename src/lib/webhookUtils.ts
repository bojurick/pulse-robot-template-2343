
import { n8nWorkflowUtils } from "./n8nUtils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface WebhookTriggerOptions {
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
}

export interface WebhookResponse {
  success: boolean;
  status: number;
  data: any;
  workflow: any;
  contentType?: string;
  headers?: Record<string, string>;
}

const uploadFileToSupabase = async (fileBlob: Blob, filename: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('n8n')
    .upload(`workflow-results/${Date.now()}-${filename}`, fileBlob, {
      contentType: fileBlob.type,
      upsert: false
    });

  if (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file to storage');
  }

  const { data: urlData } = supabase.storage
    .from('n8n')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

export const triggerWebhook = async (
  workflowId: string,
  options: WebhookTriggerOptions = {}
): Promise<WebhookResponse> => {
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
    const contentType = response.headers.get('content-type') || '';
    
    let responseData: any;
    let fileUrls: string[] = [];
    
    // Handle different response types
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else if (contentType.includes('text/')) {
      responseData = await response.text();
    } else if (contentType.includes('application/octet-stream') || 
               contentType.includes('application/pdf') ||
               contentType.includes('image/') ||
               contentType.includes('audio/') ||
               contentType.includes('video/')) {
      // Handle binary files
      const blob = await response.blob();
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                     `file-${Date.now()}.${contentType.split('/')[1]}`;
      
      try {
        const fileUrl = await uploadFileToSupabase(blob, filename);
        fileUrls.push(fileUrl);
        responseData = {
          message: 'File downloaded successfully',
          fileUrls: fileUrls,
          filename: filename,
          contentType: contentType,
          size: blob.size
        };
      } catch (uploadError) {
        console.error('File upload failed:', uploadError);
        responseData = {
          error: 'File download succeeded but upload to storage failed',
          contentType: contentType
        };
      }
    } else {
      // Fallback for other content types
      responseData = await response.text();
    }
    
    const result: WebhookResponse = {
      success: response.ok,
      status: response.status,
      data: responseData,
      workflow: workflow,
      contentType,
      headers: Object.fromEntries(response.headers.entries())
    };

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    toast({
      title: "Workflow triggered! 🎯",
      description: `Successfully executed ${workflow.name} workflow`,
    });

    return result;
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
