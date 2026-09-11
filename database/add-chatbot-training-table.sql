-- Create chatbot_training table for AI training data
CREATE TABLE IF NOT EXISTS public.chatbot_training (
  id BIGSERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.chatbot_training ENABLE ROW LEVEL SECURITY;

-- Create policies for chatbot_training
CREATE POLICY "Super admins can manage training data"
  ON public.chatbot_training FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );

CREATE POLICY "Admins can manage training data"
  ON public.chatbot_training FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Staff can view training data"
  ON public.chatbot_training FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role = 'staff'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_training_question ON public.chatbot_training(question);
CREATE INDEX IF NOT EXISTS idx_chatbot_training_active ON public.chatbot_training(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_training_created_by ON public.chatbot_training(created_by);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.chatbot_training TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
