export const statuses=['New','Researching','Ready to Contact','Contacted','Replied','Qualified','Quote Sent','Booked','Delivered','Paid','Lost'] as const;
export type Status=typeof statuses[number];
export interface Activity {id:string;at:string;text:string}
export interface Lead {id:string;person:string;business:string;channel:string;url:string;segment:string;location:string;notes:string;source:string;value:number;lastContact:string;nextFollowUp:string;status:Status;activity:Activity[]}
export interface Offer {id:string;name:string;price:number;deposit:number;duration:string;deliverables:string;turnaround:string;revisions:number;radius:string;usage:string;addons:string;active:boolean}
export interface Quote {id:string;number:string;leadId:string;offerId:string;revision:number;scope:string;schedule:string;deliverables:string;price:number;deposit:number;turnaround:string;usage:string;expiration:string;terms:string;created:string}
export interface AppData {leads:Lead[];offers:Offer[];quotes:Quote[];experimentStart:string}
