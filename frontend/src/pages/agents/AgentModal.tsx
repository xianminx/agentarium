import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useCreateAgent } from "../../hooks/useMutations";
import { toast } from "sonner"

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: any | null;
}

export function AgentModal({ open, onOpenChange, editing }: Props) {
  const { register, handleSubmit, reset } = useForm();
  const { mutateAsync, isPending } = useCreateAgent();

  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        description: editing.description,
        model: editing.model,
        temperature: editing.temperature,
      });
    } else {
      reset({ name: "", description: "", model: "gpt-4o", temperature: 0.7 });
    }
  }, [editing, reset]);

  const onSubmit = async (values: any) => {
    try {
      await mutateAsync(values);
      toast.info("Agent saved successfully." );
      onOpenChange(false);
    } catch (e) {
      toast.error("Could not save agent.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Agent" : "Create Agent"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input {...register("name", { required: true })} />
          </div>

          <div>
            <Label>Model</Label>
            <Input {...register("model")} />
          </div>

          <div>
            <Label>Temperature</Label>
            <Input type="number" step="0.1" {...register("temperature", { valueAsNumber: true })} />
          </div>

          <div>
            <Label>Description</Label>
            <textarea {...register("description")} className="w-full rounded-md p-2 bg-transparent border border-white/10" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
