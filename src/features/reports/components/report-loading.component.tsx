type ReportLoadingProps = {
  height?: number;
  message?: string;
};

export default function ReportLoading({
  height = 320,
  message = "Loading data...",
}: ReportLoadingProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height }}
    >
      <p>{message}</p>
    </div>
  );
}
