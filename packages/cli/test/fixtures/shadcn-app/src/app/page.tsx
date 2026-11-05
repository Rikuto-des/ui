import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Fancy } from "@/components/ui/fancy-thing";

export default function Page() {
  return <Button>{String([Dialog, DialogContent, DialogTrigger, DropdownMenu, DropdownMenuItem, Label, Fancy].length)}</Button>;
}
