"use client";

export function DebugGridTest() {
  // console.log("🧪 DebugGridTest: Component rendered successfully");

  return (
    <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4">
      <h3 className="font-bold text-red-800">Debug Grid Test Component</h3>
      <p className="text-red-700">If you can see this, the grid area is rendering correctly!</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded bg-blue-100 p-2">Grid Item 1</div>
        <div className="rounded bg-green-100 p-2">Grid Item 2</div>
        <div className="rounded bg-yellow-100 p-2">Grid Item 3</div>
        <div className="rounded bg-purple-100 p-2">Grid Item 4</div>
      </div>
    </div>
  );
}
