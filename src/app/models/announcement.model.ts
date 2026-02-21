export interface Announcement {
  id: string;
  title: string;
  content: string;
  important: boolean; // important — show at the top with a red badge
  createdAt: Date;
  authorId: string;
}
