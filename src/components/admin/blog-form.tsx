import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useForm } from 'react-hook-form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from '../../lib/supabase/browser';
import { createPostClient } from '@/lib/supabase/blog';
import TipTapEditor from './tiptap-editor';
import { FileUpload } from './file-upload';

interface PostFormData {
  title: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  featured_image: string;
}

export default function PostForm() {
  const [content, setContent] = React.useState('');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormData>();

  React.useEffect(() => {
    console.log({ content })
  }, [content])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
        allowBase64: true,
      }),
    ],
    content: '',
    editorProps: {
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];

          (async () => {
            if (!file.type.includes('image')) return false;

            event.preventDefault();

            try {
              const supabase = createClient();
              const fileExt = file.name.split('.').pop();
              const filePath = `upload-${Date.now()}.${fileExt}`;

              const { error } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

              if (error) throw error;

              const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

              const node = view.state.schema.nodes.image.create({ src: publicUrl });
              const transaction = view.state.tr.insert(view.state.selection.from, node);
              view.dispatch(transaction);

              return true;
            } catch (error) {
              console.error('Error uploading image:', error);
              return false;
            }
          })(); // Immediately Invoked Function Expression
        }
        return false;
      },
    },
  });

  const onSubmit = async (data: PostFormData) => {
    if (!editor) return;

    try {
      const postData = {
        ...data,
        content,
        status: 'draft' as const
      };
      const post = await createPostClient(postData)
      window.location.href = '/admin/posts';
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title', { required: true })}
                className="mt-1"
              />
              {errors.title && <span className="text-red-500">Title is required</span>}
            </div>

            <div>
              <Label>Content</Label>
              <div className="min-h-[400px]">
                <TipTapEditor onChange={setContent} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="excerpt">
            <TabsList>
              <TabsTrigger value="excerpt">Excerpt</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="featured">Featured Image</TabsTrigger>
            </TabsList>

            <TabsContent value="excerpt">
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  {...register('excerpt')}
                  placeholder="Brief description of the post"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  {...register('seo_title')}
                  placeholder="Title for search engines"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Input
                  id="seo_description"
                  {...register('seo_description')}
                  placeholder="Description for search engines"
                />
              </div>
            </TabsContent>

            <TabsContent value="featured">
              <div className='flex gap-4'>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    {...register('featured_image')}
                    placeholder="URL of the featured image"
                  />
                </div>
                <div>
                  <FileUpload
                    isPublic={true}
                    bucketName="blog-images"
                    onUpload={(url) => setValue('featured_image', url)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.href = '/admin/posts'}
        >
          Cancel
        </Button>
        <Button type="submit">Save Draft</Button>
      </div>
    </form>
  );
}