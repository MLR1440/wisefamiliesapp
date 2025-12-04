-- Temporary admin policies (will need to be updated when auth is added)
-- Allow all operations on modules for now
CREATE POLICY "Temp: Allow all module operations" 
ON public.modules 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow all operations on module_prompts for now
CREATE POLICY "Temp: Allow all prompt operations" 
ON public.module_prompts 
FOR ALL 
USING (true)
WITH CHECK (true);