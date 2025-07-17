
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Filter, Download, Eye, MoreHorizontal, ChevronUp, ChevronDown, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface FormSubmission {
  id: string;
  workflow_name: string;
  submitted_at: string;
  status: 'success' | 'failed' | 'pending';
  data: Record<string, any>;
  response_time: number;
  user_agent?: string;
}

interface SubmissionHistoryProps {
  workflowId?: string;
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ workflowId }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('submitted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  // Mock data - in real app, this would come from Supabase
  useEffect(() => {
    const mockSubmissions: FormSubmission[] = [
      {
        id: '1',
        workflow_name: 'Contact Form',
        submitted_at: '2024-01-15T10:30:00Z',
        status: 'success',
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          company: 'Acme Corp',
          message: 'Interested in your services'
        },
        response_time: 250
      },
      {
        id: '2',
        workflow_name: 'Support Request',
        submitted_at: '2024-01-15T09:15:00Z',
        status: 'pending',
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          priority: 'high',
          message: 'Urgent technical issue'
        },
        response_time: 0
      },
      {
        id: '3',
        workflow_name: 'Newsletter Signup',
        submitted_at: '2024-01-14T16:45:00Z',
        status: 'failed',
        data: {
          email: 'invalid-email',
          newsletter: true
        },
        response_time: 150
      }
    ];

    setTimeout(() => {
      setSubmissions(mockSubmissions);
      setLoading(false);
    }, 1000);
  }, [workflowId]);

  // Filter and sort submissions
  const filteredSubmissions = submissions
    .filter(submission => {
      const matchesSearch = searchTerm === '' || 
        submission.workflow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(submission.data).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortField as keyof FormSubmission];
      const bValue = b[sortField as keyof FormSubmission];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      return ((aValue as any) - (bValue as any)) * direction;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    // Mock export functionality
    const data = filteredSubmissions.map(submission => ({
      ID: submission.id,
      Workflow: submission.workflow_name,
      'Submitted At': format(new Date(submission.submitted_at), 'yyyy-MM-dd HH:mm:ss'),
      Status: submission.status,
      'Response Time (ms)': submission.response_time,
      Data: JSON.stringify(submission.data)
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    // PDF export would be implemented similarly
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="flex items-center space-x-1">
        {getStatusIcon(status)}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Submission History</CardTitle>
            <CardDescription>
              View and manage form submissions {workflowId ? 'for this workflow' : 'across all workflows'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.' 
                : 'No form submissions have been received yet.'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('workflow_name')}
                    >
                      Workflow
                      {sortField === 'workflow_name' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort('submitted_at')}
                    >
                      Submitted
                      {sortField === 'submitted_at' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission, index) => (
                  <motion.tr
                    key={submission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm">
                      #{submission.id}
                    </TableCell>
                    <TableCell className="font-medium">
                      {submission.workflow_name}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{format(new Date(submission.submitted_at), 'MMM dd, yyyy')}</div>
                        <div className="text-muted-foreground">{format(new Date(submission.submitted_at), 'HH:mm:ss')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(submission.status)}
                    </TableCell>
                    <TableCell>
                      {submission.response_time > 0 ? `${submission.response_time}ms` : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedSubmission(submission)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Submission Details Modal */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              View the complete submission data and metadata
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Submission ID</Label>
                  <p className="font-mono text-sm mt-1">#{selectedSubmission.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Workflow</Label>
                  <p className="text-sm mt-1">{selectedSubmission.workflow_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Response Time</Label>
                  <p className="text-sm mt-1">
                    {selectedSubmission.response_time > 0 ? `${selectedSubmission.response_time}ms` : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-sm font-medium">Submitted At</Label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedSubmission.submitted_at), 'MMMM dd, yyyy at HH:mm:ss')}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Form Data</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(selectedSubmission.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SubmissionHistory;
