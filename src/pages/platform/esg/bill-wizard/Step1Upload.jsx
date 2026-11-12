import React from 'react';
import { Button, Notice, Select } from '../ui';

export function Step1Upload({
  t,
  facilities = [],
  uploadAction,
  onUpload
}) {
  return (
    <form onSubmit={onUpload} className="space-y-4 max-w-xl">
      <Notice error={uploadAction.error} message={uploadAction.message} />
      <Select
        label={t.facility}
        name="facility_id"
        required
        options={(facilities || []).map((f) => [f.id, f.name])}
      />
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-mist mb-1">
          {t.file}
        </label>
        <input
          type="file"
          name="file"
          required
          accept=".pdf,.png,.jpg,.jpeg"
          className="w-full text-sm text-registry file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-emerald/20 file:text-emerald-300 hover:file:bg-emerald/30"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-registry">
        <input type="checkbox" name="ocr" value="true" />
        <span>{t.runOcr}</span>
      </label>
      <Button type="submit" disabled={uploadAction.busy}>
        {uploadAction.busy ? 'Uploading & Analyzing…' : t.uploadBtn}
      </Button>
    </form>
  );
}

export default Step1Upload;
