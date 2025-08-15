import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "./button";
import { 
  UserPlus, 
  Save, 
  Download, 
  Settings, 
  Trash2, 
  Edit3,
  ChevronRight,
  PlayCircle,
  Heart,
  Share2
} from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    asChild: {
      control: { type: "boolean" },
    },
  },
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    children: "Link",
  },
};

// Size Variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// Icon Variations
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button>
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
        <Button variant="outline">
          <Save className="h-4 w-4" />
          Save
        </Button>
        <Button variant="secondary">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost">
          <Settings className="h-4 w-4" />
          Settings
        </Button>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button size="icon" variant="outline">
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
};

// All Variants Comparison
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">Current System</h3>
        <div className="space-y-2">
          <Button className="w-full">Primary</Button>
          <Button variant="secondary" className="w-full">Secondary</Button>
          <Button variant="outline" className="w-full">Outline</Button>
          <Button variant="ghost" className="w-full">Ghost</Button>
          <Button variant="destructive" className="w-full">Destructive</Button>
          <Button variant="link" className="w-full">Link</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">With Icons</h3>
        <div className="space-y-2">
          <Button className="w-full">
            <PlayCircle className="h-4 w-4" />
            Play
          </Button>
          <Button variant="secondary" className="w-full">
            <Heart className="h-4 w-4" />
            Like
          </Button>
          <Button variant="outline" className="w-full">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" className="w-full">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-muted-foreground">Disabled States</h3>
        <div className="space-y-2">
          <Button disabled className="w-full">Primary</Button>
          <Button variant="secondary" disabled className="w-full">Secondary</Button>
          <Button variant="outline" disabled className="w-full">Outline</Button>
          <Button variant="ghost" disabled className="w-full">Ghost</Button>
          <Button variant="destructive" disabled className="w-full">Destructive</Button>
        </div>
      </div>
    </div>
  ),
};

// Color Migration Test Component
export const ColorMigrationTest: Story = {
  render: () => (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">🧪 Color Migration Safety Test</h3>
        <p className="text-sm text-muted-foreground">
          Testing that existing buttons still work with transparent secondary colors
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Before Migration (Reference)</h4>
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <Button className="w-full">Primary Button</Button>
            <Button variant="outline" className="w-full">Outline Button</Button>
            <Button variant="ghost" className="w-full">Ghost Button</Button>
            <div className="text-xs text-muted-foreground mt-2">
              Secondary was solid color: #1d293f
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-medium text-sm">After Migration (Current)</h4>
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <Button className="w-full">Primary Button</Button>
            <Button variant="secondary" className="w-full">Secondary (Now Transparent)</Button>
            <Button variant="outline" className="w-full">Outline Button</Button>
            <Button variant="ghost" className="w-full">Ghost Button</Button>
            <div className="text-xs text-muted-foreground mt-2">
              Secondary is now transparent with proper foreground color
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium text-sm">✅ Migration Success Indicators</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-background border rounded-lg">
            <h5 className="font-medium text-xs mb-2">Light Background</h5>
            <Button variant="secondary" size="sm">Secondary</Button>
          </div>
          <div className="p-3 bg-card border rounded-lg">
            <h5 className="font-medium text-xs mb-2">Card Background</h5>
            <Button variant="secondary" size="sm">Secondary</Button>
          </div>
          <div className="p-3 bg-muted border rounded-lg">
            <h5 className="font-medium text-xs mb-2">Muted Background</h5>
            <Button variant="secondary" size="sm">Secondary</Button>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Real-world Usage Examples
export const RealWorldExamples: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h3 className="font-medium text-lg">🎯 Real-world Button Usage</h3>
        
        {/* Header Actions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Header Actions</h4>
          <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
            <h5 className="font-medium">Creator Inspiration</h5>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Creators
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4" />
                New Creator
              </Button>
            </div>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Form Actions</h4>
          <div className="p-4 bg-card border rounded-lg space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <input className="w-full p-2 border rounded-md" placeholder="Enter project name..." />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost">Cancel</Button>
              <Button variant="outline">Save Draft</Button>
              <Button>
                <Save className="h-4 w-4" />
                Save Project
              </Button>
            </div>
          </div>
        </div>
        
        {/* Card Actions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Card Actions</h4>
          <div className="p-4 bg-card border rounded-lg space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-medium">Video Project</h5>
                <p className="text-sm text-muted-foreground">Last edited 2 hours ago</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Interactive States
export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h3 className="font-medium text-lg">🎮 Interactive States</h3>
        <p className="text-sm text-muted-foreground">
          Hover and focus states for all button variants
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["default", "secondary", "outline", "ghost", "destructive"].map((variant) => (
          <div key={variant} className="space-y-2">
            <h4 className="font-medium text-sm capitalize">{variant}</h4>
            <div className="space-y-2">
              <Button 
                variant={variant as any} 
                className="w-full"
              >
                Normal
              </Button>
              <Button 
                variant={variant as any} 
                className="w-full hover:scale-105"
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Hover Effect
              </Button>
              <Button 
                variant={variant as any} 
                className="w-full"
                disabled
              >
                Disabled
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};