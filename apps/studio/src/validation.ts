import type {Project} from "./model.ts";
export function projectErrors(project:Project){
  const errors:Partial<Record<"name"|"description"|"owner"|"due",string>>={};
  if(!project.name.trim())errors.name="プロジェクト名を入力してください。空白だけでは保存できません。";
  else if(project.name.trim().length>100)errors.name="プロジェクト名は100文字以内で入力してください。";
  if(project.description.length>2000)errors.description="説明は2,000文字以内で入力してください。";
  if(!["mika","kai","alex"].includes(project.owner))errors.owner="担当者を候補から選択してください。";
  const date=new Date(project.due+"T12:00:00Z");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(project.due)||Number.isNaN(date.valueOf())||date.toISOString().slice(0,10)!==project.due)errors.due="有効な期限を入力してください。";
  return errors;
}
