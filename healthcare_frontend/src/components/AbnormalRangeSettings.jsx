import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

export default function AbnormalRangeSettings() {
  const [ranges, setRanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getAbnormalRanges();
      setRanges(data);
    } catch (error) {
      console.error('Error fetching abnormal ranges:', error);
      setError('获取异常值设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (rangeId, field, value) => {
    setRanges(ranges.map(range => {
      if (range._id === rangeId) {
        const newRange = { ...range };
        
        // 解析嵌套字段路径，如 'normalRange.systolic.min'
        const fieldParts = field.split('.');
        let current = newRange;
        
        for (let i = 0; i < fieldParts.length - 1; i++) {
          if (!current[fieldParts[i]]) {
            current[fieldParts[i]] = {};
          }
          current = current[fieldParts[i]];
        }
        
        current[fieldParts[fieldParts.length - 1]] = parseFloat(value) || 0;
        return newRange;
      }
      return range;
    }));
  };

  const handleSave = async (rangeId) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const range = ranges.find(r => r._id === rangeId);
      if (!range) return;

      await apiService.updateAbnormalRange(rangeId, {
        name: range.name,
        normalRange: range.normalRange,
        unit: range.unit,
        description: range.description
      });

      setSuccess('保存成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving range:', error);
      setError('保存失败：' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await Promise.all(ranges.map(range => 
        apiService.updateAbnormalRange(range._id, {
          name: range.name,
          normalRange: range.normalRange,
          unit: range.unit,
          description: range.description
        })
      ));

      setSuccess('全部保存成功');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving all ranges:', error);
      setError('批量保存失败：' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const renderRangeInputs = (range) => {
    switch (range.measurementType) {
      case 'blood_pressure':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">收缩压范围 ({range.unit})</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="最小值"
                  value={range.normalRange?.systolic?.min || ''}
                  onChange={(e) => handleRangeChange(range._id, 'normalRange.systolic.min', e.target.value)}
                  className="w-20"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="最大值"
                  value={range.normalRange?.systolic?.max || ''}
                  onChange={(e) => handleRangeChange(range._id, 'normalRange.systolic.max', e.target.value)}
                  className="w-20"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">舒张压范围 ({range.unit})</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="最小值"
                  value={range.normalRange?.diastolic?.min || ''}
                  onChange={(e) => handleRangeChange(range._id, 'normalRange.diastolic.min', e.target.value)}
                  className="w-20"
                />
                <span className="text-gray-500">-</span>
                <Input
                  type="number"
                  placeholder="最大值"
                  value={range.normalRange?.diastolic?.max || ''}
                  onChange={(e) => handleRangeChange(range._id, 'normalRange.diastolic.max', e.target.value)}
                  className="w-20"
                />
              </div>
            </div>
          </div>
        );

      case 'heart_rate':
        return (
          <div>
            <Label className="text-sm font-medium">心率范围 ({range.unit})</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder="最小值"
                value={range.normalRange?.heartRate?.min || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.heartRate.min', e.target.value)}
                className="w-20"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="最大值"
                value={range.normalRange?.heartRate?.max || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.heartRate.max', e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'temperature':
        return (
          <div>
            <Label className="text-sm font-medium">体温范围 ({range.unit})</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                step="0.1"
                placeholder="最小值"
                value={range.normalRange?.temperature?.min || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.temperature.min', e.target.value)}
                className="w-20"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                step="0.1"
                placeholder="最大值"
                value={range.normalRange?.temperature?.max || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.temperature.max', e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'oxygen_saturation':
        return (
          <div>
            <Label className="text-sm font-medium">血氧饱和度范围 ({range.unit})</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder="最小值"
                value={range.normalRange?.oxygenSaturation?.min || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.oxygenSaturation.min', e.target.value)}
                className="w-20"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="最大值"
                value={range.normalRange?.oxygenSaturation?.max || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.oxygenSaturation.max', e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        );

      case 'blood_glucose':
        return (
          <div>
            <Label className="text-sm font-medium">血糖范围 ({range.unit})</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder="最小值"
                value={range.normalRange?.bloodGlucose?.min || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.bloodGlucose.min', e.target.value)}
                className="w-20"
              />
              <span className="text-gray-500">-</span>
              <Input
                type="number"
                placeholder="最大值"
                value={range.normalRange?.bloodGlucose?.max || ''}
                onChange={(e) => handleRangeChange(range._id, 'normalRange.bloodGlucose.max', e.target.value)}
                className="w-20"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">加载异常值设置...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">异常值范围设置</h2>
          <p className="text-gray-600 mt-1">配置各项生理指标的正常范围，用于自动检测异常值</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchRanges}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            保存全部
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="grid gap-6">
        {ranges.map((range) => (
          <Card key={range._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {range.name}
                    <Badge variant="secondary">{range.measurementType}</Badge>
                  </CardTitle>
                  <CardDescription>{range.description}</CardDescription>
                </div>
                <Button
                  onClick={() => handleSave(range._id)}
                  disabled={saving}
                  size="sm"
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-1" />
                  保存
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderRangeInputs(range)}
              
              <div>
                <Label className="text-sm font-medium">描述</Label>
                <Textarea
                  value={range.description || ''}
                  onChange={(e) => handleRangeChange(range._id, 'description', e.target.value)}
                  placeholder="输入描述信息..."
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 