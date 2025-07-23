import ScriptManager from '@/components/script-management/script-manager'

export default function TestScriptManagerPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Tweet Hunter-Style Script Manager</h1>
        <p className="text-muted-foreground">
          Manage your scripts with drag-and-drop scheduling, just like Tweet Hunter
        </p>
      </div>
      
      <ScriptManager />
    </div>
  )
}