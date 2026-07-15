"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/primitives/button/button";
import { RadioGroup } from "@/components/primitives/radio-group/radio-group";
import { Modal } from "./modal";

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>保存到项目</Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        title="保存计算结果到项目"
        description="保存输入、结果、有效性和计算版本。"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button variant="primary" onClick={() => setOpen(false)}>确认保存</Button>
          </>
        }
      >
        <RadioGroup
          label="保存位置"
          defaultValue="current"
          variant="card"
          options={[
            { value: "current", label: "当前项目", description: "某金矿选矿改造项目" },
            { value: "standalone", label: "独立记录", description: "暂不关联项目" },
          ]}
        />
      </Modal>
    </>
  );
}

const meta = {
  title: "07 Overlays/Modal",
  component: Modal,
  args: { open: false, onOpenChange: () => undefined, title: "保存到项目", children: null },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SaveProject: Story = { render: () => <ModalDemo /> };
