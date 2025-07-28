import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useGetCurriculumByIdQuery, useUpdateCurriculumMutation, useDeleteCurriculumMutation } from '@/api/curriculumApi';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Edit, Trash2, AlertTriangle, FileText, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  domain: z.enum(['frontend', 'backend', 'devops', 'qa', 'hr']),
  content: z.string().min(20, { message: 'Content must be at least 20 characters' }),
});

export default function CurriculumDetailsPage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/curriculum/:id');
  const curriculumId = params?.id;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: curriculum = {} as any, isLoading, isError } = useGetCurriculumByIdQuery(curriculumId || '');
  const [updateCurriculum, { isLoading: isUpdating }] = useUpdateCurriculumMutation();
  const [deleteCurriculum, { isLoading: isDeleting }] = useDeleteCurriculumMutation();
  
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      domain: 'frontend',
      content: '',
    },
  });
  
  // Update form values when curriculum data is loaded
  React.useEffect(() => {
    if (curriculum) {
      form.reset({
        title: curriculum.title,
        description: curriculum.description,
        domain: curriculum.domain,
        content: curriculum.content,
      });
    }
  }, [curriculum, form]);
  
  const handleEdit = async (data: z.infer<typeof formSchema>) => {
    if (!curriculumId) return;
    
    try {
      await updateCurriculum({
        id: curriculumId,
        ...data,
        curriculumData: undefined as any
      }).unwrap();
      
      toast({
        title: 'Success',
        description: 'Curriculum updated successfully',
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update curriculum',
        variant: 'destructive',
      });
    }
  };
  
  const handleDelete = async () => {
    if (!curriculumId) return;
    
    try {
      await deleteCurriculum(curriculumId).unwrap();
      
      toast({
        title: 'Success',
        description: 'Curriculum deleted successfully',
      });
      
      setLocation('/curriculum');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete curriculum',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setLocation('/curriculum')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Skeleton className="h-10 w-64" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (isError || !curriculum) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => setLocation('/curriculum')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Curriculum
            </Button>
          </div>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load curriculum details. The item may have been deleted or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => setLocation('/curriculum')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">{curriculum.title}</h1>
          </div>
          
          <div className="flex space-x-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Curriculum</DialogTitle>
                  <DialogDescription>
                    Update the curriculum details below.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="min-h-[80px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select domain" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="frontend">Frontend</SelectItem>
                              <SelectItem value="backend">Backend</SelectItem>
                              <SelectItem value="devops">DevOps</SelectItem>
                              <SelectItem value="qa">QA</SelectItem>
                              <SelectItem value="hr">HR</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="min-h-[200px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? 'Updating...' : 'Update Curriculum'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Curriculum</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this curriculum? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Details</CardTitle>
                <CardDescription>
                  Domain: {curriculum.domain.charAt(0).toUpperCase() + curriculum.domain.slice(1)}
                </CardDescription>
              </CardHeader>
              
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mx-6 my-2">
                  <TabsTrigger value="content">
                    <FileText className="h-4 w-4 mr-2" />
                    Content
                  </TabsTrigger>
                  <TabsTrigger value="metadata">
                    <Clock className="h-4 w-4 mr-2" />
                    Metadata
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="p-6 pt-2">
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-xl font-semibold mb-4">{curriculum.title}</h3>
                    <p className="text-muted-foreground mb-6">{curriculum.description}</p>
                    <div className="whitespace-pre-wrap">{curriculum.content}</div>
                  </div>
                </TabsContent>
                
                <TabsContent value="metadata" className="p-6 pt-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">Created By</h4>
                      <p>{curriculum.createdBy || 'Unknown'}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Created At</h4>
                      <p>{new Date(curriculum.createdAt).toLocaleString()}</p>
                    </div>
                    
                    {curriculum.updatedAt && (
                      <div>
                        <h4 className="text-sm font-medium">Last Updated</h4>
                        <p>{new Date(curriculum.updatedAt).toLocaleString()}</p>
                      </div>
                    )}
                    
                    {curriculum.attachments && curriculum.attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium">Attachments</h4>
                        <ul className="list-disc pl-5">
                          {curriculum.attachments.map((attachment: any, index: number) => (
                            <li key={index}>
                              <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {attachment.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">No related resources found.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" size="sm">
                  Add Related Resource
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}