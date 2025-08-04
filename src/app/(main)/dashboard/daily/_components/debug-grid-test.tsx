"use client";

export function DebugGridTest() {
  console.log("🧪 DebugGridTest: Component rendered successfully");
  
  return (
    <div className="p-4 border-2 border-red-500 bg-red-50 rounded-lg">
      <h3 className="text-red-800 font-bold">Debug Grid Test Component</h3>
      <p className="text-red-700">If you can see this, the grid area is rendering correctly!</p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-blue-100 p-2 rounded">Grid Item 1</div>
        <div className="bg-green-100 p-2 rounded">Grid Item 2</div>
        <div className="bg-yellow-100 p-2 rounded">Grid Item 3</div>
        <div className="bg-purple-100 p-2 rounded">Grid Item 4</div>
      </div>
    </div>
  );
}