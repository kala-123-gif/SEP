import { Subject, AcademicYear } from '../types'; import { api } from '../lib/api'; import { INITIAL_SUBJECTS } from '../lib/seedData';
let cache:Subject[]|null=null;
export async function getSubjects(branch?:string,academicYear?:AcademicYear|string,semester?:number):Promise<Subject[]>{if(!cache){try{const r=await api<{subjects:Subject[]}>('/api/subjects');cache=r.subjects;}catch{cache=[...INITIAL_SUBJECTS];}}let list=cache||[];if(branch)list=list.filter(s=>s.branch.toUpperCase()===branch.toUpperCase()||s.branch.toUpperCase()==='COMMON');if(academicYear)list=list.filter(s=>s.academicYear===academicYear);if(semester!==undefined&&semester!==null)list=list.filter(s=>Number(s.semester)===Number(semester));return list;}
export async function seedDefaultSubjects(){cache=[...INITIAL_SUBJECTS];}
export async function getSubjectById(id:string){return (await getSubjects()).find(s=>s.id===id);}
