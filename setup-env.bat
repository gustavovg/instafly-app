@echo off
echo Configurando variaveis de ambiente na Vercel...

echo Adicionando VITE_SUPABASE_URL...
echo https://ezatxegbvxskfvnsfnva.supabase.co | npx vercel env add VITE_SUPABASE_URL production preview development

echo Adicionando VITE_SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NjE5MjIsImV4cCI6MjA3MjUzNzkyMn0.Ik2WimRUmyQHrlbItBsiFsh9Z4aDD-eFd92S1OJILDs | npx vercel env add VITE_SUPABASE_ANON_KEY production preview development

echo Adicionando SUPABASE_SERVICE_ROLE_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6YXR4ZWdidnhza2Z2bnNmbnZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njk2MTkyMiwiZXhwIjoyMDcyNTM3OTIyfQ.UyfuWHICCStKVjY1MXyakd9tvcfONqH4SC5QT2fKd34 | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

echo Adicionando VITE_APP_URL...
echo https://instafly-app.vercel.app | npx vercel env add VITE_APP_URL production preview development

echo Adicionando VITE_APP_NAME...
echo InstaFly | npx vercel env add VITE_APP_NAME production preview development

echo Configuracao concluida!
pause