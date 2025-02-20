export const transformNote = (note: any): any => {
  note.noteId = note.id.toString();
  delete note.id;
  note.author.authorId = note.author.id.toString();
  note.resolved = note.resolved || false;
  if (note.resolved && note.resolved_by) {
    note.resolved_by.authorId = note.resolved_by.id.toString();
  }
  return note;
};

export const transformDiscussion = (discussion: any): any => {
  discussion.discussionId = discussion.id.toString();
  delete discussion.id;
  if (Array.isArray(discussion.notes)) {
    discussion.notes = discussion.notes.map((note: any) => transformNote(note));
  }
  return discussion;
};
