CREATE POLICY "Staff can read client thumbnails" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'client-thumbnails' AND public.is_admin_staff(auth.uid()));

CREATE POLICY "Managers can upload client thumbnails" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'client-thumbnails' AND public.is_manager(auth.uid()));

CREATE POLICY "Managers can update client thumbnails" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'client-thumbnails' AND public.is_manager(auth.uid()))
  WITH CHECK (bucket_id = 'client-thumbnails' AND public.is_manager(auth.uid()));

CREATE POLICY "Managers can delete client thumbnails" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'client-thumbnails' AND public.is_manager(auth.uid()));