export default function GlobalLoading() {
  return (
    <main className="page-loading">
      <div className="container page-loading-inner">
        <div className="page-loading-bar" />
        <div className="page-loading-grid">
          <div className="page-loading-card page-loading-card-large" />
          <div className="page-loading-card" />
          <div className="page-loading-card" />
        </div>
      </div>
    </main>
  );
}
