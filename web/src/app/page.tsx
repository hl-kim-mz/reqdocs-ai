'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, FileText, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 rounded-full">
            <span className="text-indigo-700 text-sm font-semibold">
              AI 기반 문서 생성
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            요구사항에서 문서로
            <br />
            <span className="text-indigo-600">한 번에</span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            텍스트로 입력한 요구사항을 Claude AI가 분석하여 PRD와 기능 목록을
            자동으로 생성합니다.
          </p>

          <button
            onClick={() => router.push('/workspace/new')}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            시작하기
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              PRD 자동 생성
            </h3>
            <p className="text-slate-600">
              요구사항 분석, 사용자 시나리오, 제약사항까지 포함한 완성된 PRD를
              생성합니다.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-indigo-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              기능 목록 생성
            </h3>
            <p className="text-slate-600">
              MoSCoW 우선순위를 적용한 상세한 기능 목록을 테이블 형식으로
              제공합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 mt-20 py-8 text-center text-slate-600">
        <p>ReqDocs AI v0.1.0</p>
      </div>
    </div>
  );
}
