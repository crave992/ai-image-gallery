export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            AI Image Gallery
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload images, get AI-generated tags and descriptions, and search
            through your gallery
          </p>
        </div>
      </main>
    </div>
  );
}
