import type { Meta, StoryObj } from "@storybook/react";

import { Card } from "@/components/ui/card";
import { EditButton, EditableText, EditableCard } from "@/components/ui/edit-button";

const meta: Meta<typeof EditButton> = {
  title: "UI/EditButton",
  component: EditButton,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: { type: "select" },
      options: ["floating", "inline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onEdit: () => alert("Edit clicked!"),
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    onEdit: () => alert("Edit clicked!"),
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    onEdit: () => alert("Edit clicked!"),
  },
};

export const Inline: Story = {
  args: {
    variant: "inline",
    onEdit: () => alert("Edit clicked!"),
  },
};

export const EditableTextExample: Story = {
  render: () => (
    <div className="space-y-6">
      <EditableText onEdit={() => alert("Editing title!")}>
        <h2 className="text-foreground text-2xl font-bold">Hover over this title to see the edit button</h2>
      </EditableText>

      <EditableText onEdit={() => alert("Editing paragraph!")}>
        <p className="text-muted-foreground">
          This is a paragraph that becomes editable when you hover over it. The edit button appears in the bottom right
          corner.
        </p>
      </EditableText>
    </div>
  ),
};

export const EditableCardExample: Story = {
  render: () => (
    <div className="grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
      <EditableCard onEdit={() => alert("Editing card!")}>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Script Title</h3>
          <p className="text-muted-foreground mb-4">
            This is a script card that can be edited. Hover over the card to see the edit button.
          </p>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>Comedy</span>
            <span>2 min read</span>
          </div>
        </Card>
      </EditableCard>

      <EditableCard onEdit={() => alert("Editing collection!")}>
        <Card className="p-6">
          <h3 className="mb-2 text-lg font-semibold">Collection Name</h3>
          <p className="text-muted-foreground mb-4">A collection of related content that can be modified inline.</p>
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>12 items</span>
            <span>Updated 1h ago</span>
          </div>
        </Card>
      </EditableCard>
    </div>
  ),
};

export const SizeComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Small Edit Button</h3>
        <EditableText editButtonSize="sm" onEdit={() => alert("Small edit!")}>
          <p className="text-muted-foreground">Text with small edit button</p>
        </EditableText>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Medium Edit Button (Default)</h3>
        <EditableText editButtonSize="md" onEdit={() => alert("Medium edit!")}>
          <p className="text-muted-foreground">Text with medium edit button</p>
        </EditableText>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Large Edit Button</h3>
        <EditableText editButtonSize="lg" onEdit={() => alert("Large edit!")}>
          <p className="text-muted-foreground">Text with large edit button</p>
        </EditableText>
      </div>
    </div>
  ),
};
