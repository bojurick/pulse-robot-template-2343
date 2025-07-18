
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { WebhookResponse } from '@/lib/webhookUtils';
import { formatDistanceToNow } from 'date-fns';

interface WorkflowResultsProps {
  result: WebhookResponse | null;
  isLoading: boolean;
  executionHistory: any[];
}

export const WorkflowResults: React.FC<WorkflowResultsProps> = ({
  result,
  isLoading,
  executionHistory
}) => {
  const formatResponseData = (data: any) => {
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  };

  const getLanguage = (contentType?: string) => {
    if (contentType?.includes('json')) return 'json';
    if (contentType?.includes('xml')) return 'xml';
    if (contentType?.includes('html')) return 'html';
    return 'text';
  };

  const handleDownload = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `workflow-result-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!result && !isLoading && executionHistory.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#E20074]" />
            Workflow Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="output" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="output" className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E20074] border-t-transparent" />
                    <span className="text-sm text-muted-foreground">Executing workflow...</span>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.success ? "default" : "destructive"} className="flex items-center gap-1">
                      {result.success ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {result.success ? 'Success' : 'Failed'}
                    </Badge>
                    <Badge variant="secondary">
                      Status: {result.status}
                    </Badge>
                    {result.contentType && (
                      <Badge variant="outline">
                        {result.contentType}
                      </Badge>
                    )}
                  </div>

                  <div className="rounded-lg border">
                    <SyntaxHighlighter
                      language={getLanguage(result.contentType)}
                      style={vs2015}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem'
                      }}
                      wrapLongLines
                    >
                      {formatResponseData(result.data)}
                    </SyntaxHighlighter>
                  </div>

                  {result.headers && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Response Headers</h4>
                      <div className="rounded-lg border p-3 bg-muted text-sm">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(result.headers, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No output available. Trigger a workflow to see results.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              {result?.data && typeof result.data === 'object' && result.data.fileUrls ? (
                <div className="space-y-2">
                  {result.data.fileUrls.map((url: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">File {index + 1}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(url, `file-${index + 1}`)}
                        className="bg-[#E20074] hover:bg-[#E20074]/90 text-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No files available in the current result.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {executionHistory.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {executionHistory.map((execution) => (
                    <div key={execution.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={execution.status === 'success' ? "default" : "destructive"} className="flex items-center gap-1">
                            {execution.status === 'success' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {execution.status}
                          </Badge>
                          {execution.execution_time_ms && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {execution.execution_time_ms}ms
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(execution.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {execution.error_message && (
                        <p className="text-sm text-destructive mt-1">{execution.error_message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No execution history available.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};
