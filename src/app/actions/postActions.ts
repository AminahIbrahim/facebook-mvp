"use server";

import { auth } from "@/lib/auth";
import { db as prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  const category = formData.get("category") as string;

  if (!content || !content.trim()) return;

  await prisma.post.create({
    data: {
      content,
      category: (category as any) || "GENERAL",
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
}

export async function toggleLike(postId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: { postId, userId },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.like.create({
      data: { postId, userId },
    });
  }

  revalidatePath("/");
}

export async function addComment(postId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!content.trim()) return;

  await prisma.comment.create({
    data: {
      content,
      postId,
      authorId: session.user.id,
    },
  });

  revalidatePath("/");
}