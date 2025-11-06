import Avatar from "./Avatar";

interface ProfileCardProps {
  name: string;
  studentId: string;
}

export default function ProfileCard({ name, studentId }: ProfileCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        {/* Header với background gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-center text-white">
          <h1 className="text-2xl font-bold mb-2">Thông tin cá nhân</h1>
          <p className="text-blue-100 text-sm">Student Profile</p>
        </div>

        {/* Avatar và thông tin */}
        <div className="text-center space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar name={name} size="w-20 h-20" />
          </div>

          {/* Thông tin chi tiết */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-5">
              <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
              <p className="text-xl font-semibold text-gray-800">{name}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5">
              <p className="text-sm text-gray-600 mb-1">Mã số sinh viên</p>
              <p className="text-xl font-semibold text-gray-800 font-mono">
                {studentId}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Được tạo với ❤️ bằng React + Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
